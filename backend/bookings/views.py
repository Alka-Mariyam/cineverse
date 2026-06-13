from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import action
from django.db import transaction
from django.shortcuts import get_object_or_404
from .models import Booking, BookedSeat, GroupBooking, GroupBookingSeat
from .serializers import BookingSerializer, CreateBookingSerializer, GroupBookingSerializer
from theatres.models import Show, Seat

class BookingViewSet(viewsets.ModelViewSet):
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_staff:
            return Booking.objects.all()
        return Booking.objects.filter(user=self.request.user)

    @action(detail=False, methods=['post'])
    def create_booking(self, request):
        serializer = CreateBookingSerializer(data=request.data)
        if serializer.is_valid():
            show_id = serializer.validated_data['show_id']
            seat_ids = serializer.validated_data['seat_ids']
            is_reserve = serializer.validated_data.get('is_reserve', False)

            try:
                show = Show.objects.get(id=show_id)
            except Show.DoesNotExist:
                return Response({"error": "Show not found"}, status=status.HTTP_404_NOT_FOUND)

            total_amount = 0
            seats_to_book = []
            for seat_id in seat_ids:
                try:
                    seat = Seat.objects.get(id=seat_id, screen=show.screen)
                except Seat.DoesNotExist:
                    return Response({"error": f"Seat {seat_id} not found or invalid"}, status=status.HTTP_400_BAD_REQUEST)
                
                # Check if seat is already booked or reserved
                if BookedSeat.objects.filter(booking__show=show, seat=seat, booking__status__in=['Confirmed', 'Reserved']).exists():
                    return Response({"error": f"Seat {seat.row}{seat.number} is already taken"}, status=status.HTTP_400_BAD_REQUEST)
                
                if GroupBookingSeat.objects.filter(group_booking__show=show, group_booking__status='Pending', seat=seat).exists():
                    return Response({"error": f"Seat {seat.row}{seat.number} is locked in a group booking"}, status=status.HTTP_400_BAD_REQUEST)

                seats_to_book.append(seat)
                seat_price = float(show.base_price)
                if seat.seat_type == 'Premium':
                    seat_price += 100.0
                elif seat.seat_type == 'Recliner':
                    seat_price += 250.0
                total_amount += seat_price

            final_status = 'Reserved' if is_reserve else 'Pending'

            with transaction.atomic():
                booking = Booking.objects.create(user=request.user, show=show, total_amount=total_amount, status=final_status)
                for seat in seats_to_book:
                    seat_price = float(show.base_price)
                    if seat.seat_type == 'Premium':
                        seat_price += 100.0
                    elif seat.seat_type == 'Recliner':
                        seat_price += 250.0
                    BookedSeat.objects.create(booking=booking, seat=seat, price=seat_price)

            return Response(BookingSerializer(booking).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def create_checkout_session(self, request, pk=None):
        import stripe
        from django.conf import settings
        stripe.api_key = settings.STRIPE_SECRET_KEY
        
        booking = self.get_object()
        
        if booking.status == 'Confirmed':
            return Response({"error": "Already paid"}, status=status.HTTP_400_BAD_REQUEST)

        # In a real app, you'd use your actual domain
        # Get dynamic origin from request, fallback to 5175 if not available
        domain_url = request.META.get('HTTP_ORIGIN', 'http://localhost:5175')

        try:
            if settings.STRIPE_SECRET_KEY.startswith('sk_test_mock'):
                # Mock Stripe for local dev without real keys
                url = domain_url + f'/payment-success?session_id=mock_session_id_{booking.id}&booking_id={booking.id}'
                booking.stripe_session_id = f'mock_session_id_{booking.id}'
                booking.save()
                return Response({'url': url})

            checkout_session = stripe.checkout.Session.create(
                payment_method_types=['card'],
                line_items=[
                    {
                        'price_data': {
                            'currency': 'inr',
                            'unit_amount': int(booking.total_amount * 100),
                            'product_data': {
                                'name': f"{booking.show.movie.title} Ticket(s)",
                            },
                        },
                        'quantity': 1,
                    },
                ],
                mode='payment',
                success_url=domain_url + f'/payment-success?session_id={{CHECKOUT_SESSION_ID}}&booking_id={booking.id}',
                cancel_url=domain_url + f'/ticket/{booking.id}',
            )
            
            booking.stripe_session_id = checkout_session['id']
            booking.save()
            
            return Response({'url': checkout_session.url})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def verify_payment(self, request):
        session_id = request.data.get('session_id')
        booking_id = request.data.get('booking_id')
        
        if not session_id or not booking_id:
            return Response({"error": "Missing parameters"}, status=status.HTTP_400_BAD_REQUEST)

        import stripe
        from django.conf import settings
        stripe.api_key = settings.STRIPE_SECRET_KEY

        try:
            if settings.STRIPE_SECRET_KEY.startswith('sk_test_mock'):
                # Mock Stripe verify
                booking = Booking.objects.get(id=booking_id)
                if booking.stripe_session_id == session_id:
                    session = type('obj', (object,), {'payment_status': 'paid'})
                else:
                    return Response({"status": "failed"}, status=status.HTTP_400_BAD_REQUEST)
            else:
                session = stripe.checkout.Session.retrieve(session_id)
                booking = Booking.objects.get(id=booking_id)

            if session.payment_status == 'paid' and booking.stripe_session_id == session_id:
                if booking.status != 'Confirmed':
                    booking.status = 'Confirmed'
                    
                    # Generate Enterprise QR Code
                    from qrcodes.models import QRCode as EnterpriseQR
                    from io import BytesIO
                    from django.core.files.base import ContentFile
                    import qrcode
                    
                    # Create generic QR object
                    eqr = EnterpriseQR.objects.create(
                        entity_id=booking.id,
                        entity_type='Booking',
                        generated_by=booking.user
                    )
                    
                    # Point to Vercel URL with the new generic token
                    validation_url = f"https://cineverse-smoky.vercel.app/validate/{booking.id}/{eqr.qr_token}"
                    
                    img = qrcode.make(validation_url)
                    buffer = BytesIO()
                    img.save(buffer, format='PNG')
                    
                    # Save the physical image to both the booking and the QR model
                    file_content = ContentFile(buffer.getvalue())
                    booking.qr_code.save(f'qr_{booking.id}.png', file_content, save=False)
                    eqr.qr_image.save(f'qr_{eqr.id}.png', file_content, save=True)
                    
                    booking.save()
                    
                return Response({"status": "success", "booking_id": booking.id})
            else:
                return Response({"status": "failed"}, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['post'], permission_classes=[AllowAny])
    def validate_ticket(self, request, pk=None):
        booking = self.get_object()
        token_provided = request.data.get('token')

        if str(booking.security_token) != token_provided:
            return Response({"error": "Invalid ticket token"}, status=status.HTTP_403_FORBIDDEN)

        if booking.status != 'Confirmed':
            return Response({"error": "This booking is not confirmed."}, status=status.HTTP_400_BAD_REQUEST)

        is_already_used = booking.is_scanned

        if not is_already_used:
            # Mark it as used permanently
            booking.is_scanned = True
            booking.save()

        # Build response with movie details
        seats_str = ", ".join([str(bs.seat.row) + str(bs.seat.number) for bs in booking.booked_seats.all()])
        
        ticket_data = {
            "movie_title": booking.show.movie.title,
            "theatre": booking.show.screen.theatre.name,
            "screen": booking.show.screen.name,
            "date": booking.show.date,
            "time": booking.show.start_time,
            "seats": seats_str,
            "user": booking.user.username,
            "amount": booking.total_amount,
            "already_scanned": is_already_used
        }

        return Response(ticket_data)

class GroupBookingViewSet(viewsets.ModelViewSet):
    serializer_class = GroupBookingSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'token'

    def get_queryset(self):
        return GroupBooking.objects.filter(organizer=self.request.user)

    @action(detail=False, methods=['post'])
    def create_group(self, request):
        show_id = request.data.get('show_id')
        show = get_object_or_404(Show, id=show_id)
        group_booking = GroupBooking.objects.create(organizer=request.user, show=show, status='Pending')
        return Response(GroupBookingSerializer(group_booking).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['get'], permission_classes=[AllowAny])
    def details_by_token(self, request, token=None):
        gb = get_object_or_404(GroupBooking, token=token)
        return Response(GroupBookingSerializer(gb).data)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def add_seat(self, request, token=None):
        gb = get_object_or_404(GroupBooking, token=token)
        seat_id = request.data.get('seat_id')
        seat = get_object_or_404(Seat, id=seat_id, screen=gb.show.screen)
        
        if gb.status != 'Pending':
            return Response({"error": "This group booking is already processed."}, status=400)

        if BookedSeat.objects.filter(booking__show=gb.show, seat=seat, booking__status__in=['Confirmed', 'Reserved']).exists() or \
           GroupBookingSeat.objects.filter(group_booking__show=gb.show, seat=seat).exists():
            return Response({"error": "Seat is already taken"}, status=400)

        GroupBookingSeat.objects.create(group_booking=gb, user=request.user, seat=seat)
        return Response(GroupBookingSerializer(gb).data)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def confirm(self, request, token=None):
        gb = get_object_or_404(GroupBooking, token=token, organizer=request.user)
        if gb.status != 'Pending':
            return Response({"error": "Already confirmed."}, status=400)

        group_seats = gb.group_seats.all()
        if not group_seats.exists():
            return Response({"error": "No seats selected by friends yet."}, status=400)

        total_amount = 0
        for gseat in group_seats:
            seat_price = float(gb.show.base_price)
            if gseat.seat.seat_type == 'Premium':
                seat_price += 100.0
            elif gseat.seat.seat_type == 'Recliner':
                seat_price += 250.0
            total_amount += seat_price

        with transaction.atomic():
            booking = Booking.objects.create(user=request.user, show=gb.show, total_amount=total_amount, status='Pending')
            for gseat in group_seats:
                seat_price = float(gb.show.base_price)
                if gseat.seat.seat_type == 'Premium':
                    seat_price += 100.0
                elif gseat.seat.seat_type == 'Recliner':
                    seat_price += 250.0
                BookedSeat.objects.create(booking=booking, seat=gseat.seat, price=seat_price)
            gb.status = 'Confirmed' # Group booking is confirmed, but payment is pending on Booking
            gb.save()

        import stripe
        from django.conf import settings
        stripe.api_key = settings.STRIPE_SECRET_KEY

        domain_url = request.META.get('HTTP_ORIGIN', 'http://localhost:5175')

        try:
            if settings.STRIPE_SECRET_KEY.startswith('sk_test_mock'):
                # Mock Stripe for local dev without real keys
                url = domain_url + f'/payment-success?session_id=mock_session_id_{booking.id}&booking_id={booking.id}'
                booking.stripe_session_id = f'mock_session_id_{booking.id}'
                booking.save()
                return Response({'url': url})

            checkout_session = stripe.checkout.Session.create(
                payment_method_types=['card'],
                line_items=[
                    {
                        'price_data': {
                            'currency': 'inr',
                            'unit_amount': int(booking.total_amount * 100),
                            'product_data': {
                                'name': f"Group Booking: {booking.show.movie.title}",
                            },
                        },
                        'quantity': 1,
                    },
                ],
                mode='payment',
                success_url=domain_url + f'/payment-success?session_id={{CHECKOUT_SESSION_ID}}&booking_id={booking.id}',
                cancel_url=domain_url + f'/group-booking/{gb.token}',
            )
            
            booking.stripe_session_id = checkout_session['id']
            booking.save()
            
            return Response({'url': checkout_session.url})
        except Exception as e:
            return Response({'error': str(e)}, status=500)
