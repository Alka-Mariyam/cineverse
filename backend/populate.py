import os
import django
from datetime import date, time

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cineverse_backend.settings')
django.setup()

from movies.models import Movie
from theatres.models import Theatre, Screen, Show, Seat
from users.models import User

def populate():
    # Clean up existing data
    Movie.objects.all().delete()
    Theatre.objects.all().delete()
    User.objects.all().delete()

    # Create admin user
    User.objects.create_superuser('admin', 'admin@cineverse.com', 'admin123')

    # Create Movies
    m1 = Movie.objects.create(
        title="Inception",
        description="A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
        release_date=date(2010, 7, 16),
        duration_minutes=148,
        language="English",
        rating="PG-13",
        genre="Sci-Fi",
        trailer_url="https://www.youtube.com/watch?v=YoHD9XEInc0",
        poster_image="https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvmHnTPhSy.jpg",
        cast="Leonardo DiCaprio, Joseph Gordon-Levitt, Elliot Page",
        moods="Excited,Scared",
        is_trending=True,
        is_upcoming=False,
        is_premiere=False,
        is_new_release=False,
        is_most_booked=True,
        votes=15423,
        available_offers=[{"title": "BOGO", "desc": "Buy 1 Get 1 Free on ICICI cards."}],
        cast_and_crew=[{"name": "Leonardo DiCaprio", "role": "Cobb"}, {"name": "Christopher Nolan", "role": "Director"}]
    )

    m2 = Movie.objects.create(
        title="The Dark Knight",
        description="When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.",
        release_date=date(2008, 7, 18),
        duration_minutes=152,
        language="English",
        rating="PG-13",
        genre="Action",
        trailer_url="https://www.youtube.com/watch?v=EXeTwQWrcwY",
        poster_image="https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
        cast="Christian Bale, Heath Ledger, Aaron Eckhart",
        moods="Excited",
        is_trending=True,
        is_upcoming=False,
        is_premiere=False,
        is_new_release=True,
        is_most_booked=True,
        votes=25430,
        available_offers=[{"title": "10% Off", "desc": "Use code BATMAN10"}],
        cast_and_crew=[{"name": "Christian Bale", "role": "Batman"}, {"name": "Christopher Nolan", "role": "Director"}]
    )

    m3 = Movie.objects.create(
        title="La La Land",
        description="While navigating their careers in Los Angeles, a pianist and an actress fall in love while attempting to reconcile their aspirations for the future.",
        release_date=date(2016, 12, 9),
        duration_minutes=128,
        language="English",
        rating="PG-13",
        genre="Romance",
        trailer_url="https://www.youtube.com/watch?v=0pdqf4P9MB8",
        poster_image="https://image.tmdb.org/t/p/w500/uDO8zWDhfWwoFdKS4fzkUJt0Ry0.jpg",
        cast="Ryan Gosling, Emma Stone",
        moods="Happy,Romantic",
        is_trending=False,
        is_upcoming=False,
        is_premiere=True,
        is_new_release=False,
        is_most_booked=False,
        votes=10230,
        cast_and_crew=[{"name": "Ryan Gosling", "role": "Sebastian"}, {"name": "Emma Stone", "role": "Mia"}]
    )

    m4 = Movie.objects.create(
        title="Dune: Part Two",
        description="Paul Atreides unites with Chani and the Fremen while on a warpath of revenge against the conspirators who destroyed his family.",
        release_date=date(2024, 3, 1),
        duration_minutes=166,
        language="English",
        rating="PG-13",
        genre="Sci-Fi",
        trailer_url="https://www.youtube.com/watch?v=Way9Dexny3w",
        poster_image="https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2JGqqUT10.jpg",
        cast="Timothée Chalamet, Zendaya, Rebecca Ferguson",
        moods="Excited",
        is_trending=True,
        is_upcoming=True,
        is_premiere=True,
        is_new_release=True,
        is_most_booked=False,
        votes=5000,
        cast_and_crew=[{"name": "Timothée Chalamet", "role": "Paul"}, {"name": "Zendaya", "role": "Chani"}]
    )

    m5 = Movie.objects.create(
        title="Avengers: Endgame",
        description="After the devastating events of Infinity War, the universe is in ruins...",
        release_date=date(2019, 4, 26),
        duration_minutes=181,
        language="English",
        rating="PG-13",
        genre="Action",
        trailer_url="https://www.youtube.com/watch?v=TcMBFSGVi1c",
        poster_image="https://image.tmdb.org/t/p/w500/or06DP3rTePeXIpzRvOALdC5BaD.jpg",
        cast="Robert Downey Jr., Chris Evans, Mark Ruffalo",
        moods="Excited",
        is_trending=True,
        is_most_booked=True,
        votes=50000,
        cast_and_crew=[{"name": "Robert Downey Jr.", "role": "Iron Man"}, {"name": "Russo Bros", "role": "Director"}]
    )

    m6 = Movie.objects.create(
        title="Interstellar",
        description="A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
        release_date=date(2014, 11, 7),
        duration_minutes=169,
        language="English",
        rating="PG-13",
        genre="Sci-Fi",
        trailer_url="https://www.youtube.com/watch?v=zSWdZVtXT7E",
        poster_image="https://image.tmdb.org/t/p/w500/gEU2QlsUUHXjNpebkNjEXc21Zul.jpg",
        cast="Matthew McConaughey, Anne Hathaway",
        moods="Excited,Scared",
        votes=30200,
        cast_and_crew=[{"name": "Matthew McConaughey", "role": "Cooper"}, {"name": "Christopher Nolan", "role": "Director"}]
    )

    m7 = Movie.objects.create(
        title="Oppenheimer",
        description="The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb.",
        release_date=date(2023, 7, 21),
        duration_minutes=180,
        language="English",
        rating="R",
        genre="Drama",
        trailer_url="https://www.youtube.com/watch?v=uYPbbksJxIg",
        poster_image="https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
        cast="Cillian Murphy, Emily Blunt",
        moods="Excited",
        is_new_release=True,
        is_premiere=True,
        votes=42000,
        cast_and_crew=[{"name": "Cillian Murphy", "role": "Oppenheimer"}, {"name": "Christopher Nolan", "role": "Director"}]
    )

    m8 = Movie.objects.create(
        title="Barbie",
        description="Barbie suffers a crisis that leads her to question her world and her existence.",
        release_date=date(2023, 7, 21),
        duration_minutes=114,
        language="English",
        rating="PG-13",
        genre="Comedy",
        trailer_url="https://www.youtube.com/watch?v=pBk4NYhWNMM",
        poster_image="https://image.tmdb.org/t/p/w500/iuFNMS8U5cb6xfzi51Dbkovj7vM.jpg",
        cast="Margot Robbie, Ryan Gosling",
        moods="Happy",
        is_trending=True,
        votes=35000,
        cast_and_crew=[{"name": "Margot Robbie", "role": "Barbie"}, {"name": "Greta Gerwig", "role": "Director"}]
    )

    m9 = Movie.objects.create(
        title="Manjummel Boys",
        description="A group of friends gets into a perilous situation when one of them falls into the Guna Caves.",
        release_date=date(2024, 2, 22),
        duration_minutes=135,
        language="Malayalam",
        rating="U/A",
        genre="Survival Thriller",
        trailer_url="https://www.youtube.com/watch?v=IpwH_8ZEMkE",
        poster_image="https://image.tmdb.org/t/p/w500/1XyOikUq1yJgqS10Yq6d2hU0115.jpg",
        cast="Soubin Shahir, Sreenath Bhasi",
        moods="Excited,Scared",
        is_trending=True,
        is_most_booked=True,
        votes=125000,
        cast_and_crew=[{"name": "Soubin Shahir", "role": "Actor"}, {"name": "Chidambaram", "role": "Director"}]
    )

    m10 = Movie.objects.create(
        title="Aavesham",
        description="Three college students seek the help of a local gangster to exact revenge on their seniors.",
        release_date=date(2024, 4, 11),
        duration_minutes=158,
        language="Malayalam",
        rating="U/A",
        genre="Action Comedy",
        trailer_url="https://www.youtube.com/watch?v=9M_2W9z9NnU",
        poster_image="https://image.tmdb.org/t/p/w500/1k1G7M9A3oXgD9V1Xb1t3xH0p7J.jpg",
        cast="Fahadh Faasil, Mansoor Ali Khan",
        moods="Excited,Happy",
        is_trending=True,
        is_new_release=True,
        votes=89000,
        cast_and_crew=[{"name": "Fahadh Faasil", "role": "Ranga"}, {"name": "Jithu Madhavan", "role": "Director"}]
    )

    m11 = Movie.objects.create(
        title="Jawan",
        description="A high-octane action thriller which outlines the emotional journey of a man who is set to rectify the wrongs in the society.",
        release_date=date(2023, 9, 7),
        duration_minutes=169,
        language="Hindi",
        rating="U/A",
        genre="Action",
        trailer_url="https://www.youtube.com/watch?v=COv52Qyctws",
        poster_image="https://image.tmdb.org/t/p/w500/jILeCkWXHsqo0fR8IeT0v5Y2T7N.jpg",
        cast="Shah Rukh Khan, Nayanthara, Vijay Sethupathi",
        moods="Excited",
        is_trending=True,
        votes=250000,
        cast_and_crew=[{"name": "Shah Rukh Khan", "role": "Actor"}, {"name": "Atlee", "role": "Director"}]
    )

    m12 = Movie.objects.create(
        title="Fighter",
        description="Top IAF aviators come together in the face of imminent danger.",
        release_date=date(2024, 1, 25),
        duration_minutes=166,
        language="Hindi",
        rating="U/A",
        genre="Action",
        trailer_url="https://www.youtube.com/watch?v=6amIq_mP4xM",
        poster_image="https://image.tmdb.org/t/p/w500/5k7Hw401d5T1oM0Z6BvNnK9iU8g.jpg",
        cast="Hrithik Roshan, Deepika Padukone",
        moods="Excited",
        is_new_release=True,
        votes=45000,
        cast_and_crew=[{"name": "Hrithik Roshan", "role": "Patty"}, {"name": "Siddharth Anand", "role": "Director"}]
    )

    # Theatres
    t1 = Theatre.objects.create(name="Cineverse IMAX", location="Downtown", city="Metropolis")
    t2 = Theatre.objects.create(name="Star Cinemas", location="Uptown", city="Metropolis")
    t3 = Theatre.objects.create(name="Galaxy Multiplex", location="Suburbs", city="Metropolis")
    t4 = Theatre.objects.create(name="PVR Cinemas", location="Lulu Mall", city="Kochi")
    t5 = Theatre.objects.create(name="INOX", location="Marine Drive", city="Mumbai")

    # Screens
    s1 = Screen.objects.create(theatre=t1, name="Screen 1 (IMAX)", total_seats=100)
    s2 = Screen.objects.create(theatre=t2, name="Screen 2 (4DX)", total_seats=100)
    s3 = Screen.objects.create(theatre=t3, name="Screen 3", total_seats=100)
    s4 = Screen.objects.create(theatre=t4, name="Screen 1", total_seats=100)
    s5 = Screen.objects.create(theatre=t5, name="Screen 1 (Gold)", total_seats=100)

    # Shows
    Show.objects.create(movie=m1, screen=s1, date=date.today(), start_time=time(14, 0), end_time=time(17, 0), base_price=150.00)
    Show.objects.create(movie=m2, screen=s1, date=date.today(), start_time=time(18, 0), end_time=time(21, 0), base_price=200.00)
    Show.objects.create(movie=m3, screen=s2, date=date.today(), start_time=time(15, 0), end_time=time(17, 30), base_price=120.00)
    Show.objects.create(movie=m4, screen=s2, date=date.today(), start_time=time(19, 0), end_time=time(22, 0), base_price=250.00)
    Show.objects.create(movie=m5, screen=s3, date=date.today(), start_time=time(10, 0), end_time=time(13, 0), base_price=180.00)
    Show.objects.create(movie=m7, screen=s3, date=date.today(), start_time=time(14, 0), end_time=time(17, 0), base_price=200.00)
    
    # Shows for new Malayalam & Hindi movies
    Show.objects.create(movie=m9, screen=s4, date=date.today(), start_time=time(10, 0), end_time=time(13, 0), base_price=160.00)
    Show.objects.create(movie=m10, screen=s4, date=date.today(), start_time=time(14, 0), end_time=time(17, 0), base_price=180.00)
    Show.objects.create(movie=m11, screen=s5, date=date.today(), start_time=time(18, 30), end_time=time(21, 30), base_price=320.00)
    Show.objects.create(movie=m12, screen=s5, date=date.today(), start_time=time(21, 30), end_time=time(23, 59), base_price=290.00)
    Show.objects.create(movie=m9, screen=s1, date=date.today(), start_time=time(10, 0), end_time=time(13, 0), base_price=160.00)
    Show.objects.create(movie=m11, screen=s2, date=date.today(), start_time=time(11, 0), end_time=time(14, 0), base_price=180.00)

    # Create realistic tiered dummy seats
    rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
    for s in [s1, s2, s3, s4, s5]:
        for r in rows:
            seat_type = 'Standard'
            if r in ['C', 'D', 'E', 'F']:
                seat_type = 'Premium'
            elif r in ['G', 'H']:
                seat_type = 'Recliner'
                
            # Let's create 22 seats per row
            for n in range(1, 23):
                Seat.objects.create(screen=s, row=r, number=n, seat_type=seat_type)

    # Mock Users
    u1 = User.objects.create_user('john_doe', 'john@example.com', 'pass123')
    u2 = User.objects.create_user('jane_smith', 'jane@example.com', 'pass123')
    u3 = User.objects.create_user('rahul_kumar', 'rahul@example.com', 'pass123')
    u4 = User.objects.create_user('anjali_m', 'anjali@example.com', 'pass123')

    # Mock Reviews
    from movies.models import Review
    Review.objects.create(user=u1, movie=m1, rating=5, comment="Absolutely mind-bending!")
    Review.objects.create(user=u2, movie=m1, rating=4, comment="Great concept, slightly confusing.")
    Review.objects.create(user=u1, movie=m2, rating=5, comment="The best superhero movie ever made.")
    Review.objects.create(user=u2, movie=m4, rating=5, comment="A visual masterpiece.")
    
    # Reviews for new movies
    Review.objects.create(user=u3, movie=m9, rating=5, comment="Brilliant survival thriller! Kept me on the edge of my seat.")
    Review.objects.create(user=u4, movie=m9, rating=4, comment="Great acting, amazing cinematography in the caves.")
    Review.objects.create(user=u3, movie=m10, rating=5, comment="Fahadh is incredible as usual. Fun ride!")
    Review.objects.create(user=u1, movie=m11, rating=5, comment="SRK at his mass best! Blockbuster.")
    Review.objects.create(user=u2, movie=m11, rating=4, comment="A bit long, but total paisa vasool.")
    Review.objects.create(user=u4, movie=m12, rating=4, comment="Great aerial combat sequences, but story is predictable.")

    print("Database successfully populated with mock data including Phase 2 fields.")

if __name__ == '__main__':
    populate()
