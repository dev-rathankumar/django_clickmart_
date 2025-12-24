from django.db import models
from django.contrib.auth.models import AbstractUser

# Create your models here.
# AbstractUser = add/modify any fields.
# AbstractBaseUser = we use this if you want to get the full control over your user model
# BaseUserManager = Employee.objects = Manager


class User(AbstractUser):
    email = models.EmailField(unique=True)

    USERNAME_FIELD = "email" # you can login with email address
    REQUIRED_FIELDS = ["username"]

    def __str__(self):
        return self.email
