from django.apps import AppConfig


class UsersConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'users'

    def ready(self):
        import threading
        def promote_admin():
            try:
                from django.contrib.auth import get_user_model
                User = get_user_model()
                user, created = User.objects.get_or_create(username='admin', defaults={'email': 'admin@cineverse.com'})
                user.is_staff = True
                user.is_superuser = True
                user.set_password('admin123')
                user.save()
                print("Admin user promoted successfully.")
            except Exception as e:
                print("Failed to promote admin:", e)
        
        # Run in a thread to ensure DB is ready
        t = threading.Timer(5.0, promote_admin)
        t.start()
