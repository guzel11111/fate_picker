from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.text import slugify
from django.conf import settings


class CustomUser(AbstractUser):
    phone = models.CharField(max_length=20, blank=True, null=True)
    def __str__(self):
        return self.username


class DecisionCategory(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(max_length=120, unique=True, blank=True)
    is_active = models.BooleanField(default=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Option(models.Model):
    category = models.ForeignKey(DecisionCategory, related_name='options', on_delete=models.CASCADE)
    text = models.CharField(max_length=200)

    def __str__(self):
        return self.text


class UserChoiceSession(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    method = models.CharField(
        max_length=50,
        choices=[
            ("coin", "Монетка"),
            ("wheel", "Колесо фортуны"),
            ("yesno", "Да или нет"),
            ("drum", "Барабан"),
            ("custom", "Свои варианты")
        ],
        default="custom"
    )
    category = models.ForeignKey(DecisionCategory, on_delete=models.SET_NULL, null=True, blank=True)
    result = models.CharField(max_length=200, blank=True)

    def __str__(self):
        return f"{self.user.username} — {self.method} — {self.result}"


class UserCustomOption(models.Model):
    session = models.ForeignKey(UserChoiceSession, related_name='custom_options', on_delete=models.CASCADE)
    text = models.CharField(max_length=200)

    def __str__(self):
        return self.text


# Create your models here.
