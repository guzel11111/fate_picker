from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.text import slugify
from django.conf import settings


class CustomUser(AbstractUser):
    phone = models.CharField(
        max_length=20, blank=True, null=True, verbose_name="Телефон"
    )

    def __str__(self):
        return self.username

    class Meta:
        verbose_name = "Пользователь"
        verbose_name_plural = "Пользователи"


class DecisionCategory(models.Model):
    name = models.CharField(max_length=100, verbose_name="Название категории")
    slug = models.SlugField(
        max_length=120, unique=True, blank=True, verbose_name="Слаг"
    )
    is_active = models.BooleanField(default=True, verbose_name="Активна")

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = "Категория решений"
        verbose_name_plural = "Категории решений"


class Option(models.Model):
    category = models.ForeignKey(
        DecisionCategory,
        related_name='options',
        on_delete=models.CASCADE,
        verbose_name="Категория"
    )
    text = models.CharField(max_length=200, verbose_name="Текст варианта")

    def __str__(self):
        return self.text

    class Meta:
        verbose_name = "Вариант"
        verbose_name_plural = "Варианты"


class UserChoiceSession(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        verbose_name="Пользователь"
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата создания")
    method = models.CharField(
        max_length=50,
        choices=[
            ("coin", "Монетка"),
            ("wheel", "Колесо фортуны"),
            ("yesno", "Да или нет"),
            ("drum", "Барабан"),
            ("custom", "Свои варианты")
        ],
        default="custom",
        verbose_name="Метод выбора"
    )
    category = models.ForeignKey(
        DecisionCategory,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name="Категория"
    )
    result = models.CharField(
        max_length=200,
        blank=True,
        verbose_name="Результат"
    )

    def __str__(self):
        return f"{self.user.username} — {self.method} — {self.result}"

    class Meta:
        verbose_name = "Сессия выбора"
        verbose_name_plural = "Сессии выбора"


class UserCustomOption(models.Model):
    session = models.ForeignKey(
        UserChoiceSession,
        related_name='custom_options',
        on_delete=models.CASCADE,
        verbose_name="Сессия"
    )
    text = models.CharField(max_length=200, verbose_name="Текст варианта")

    def __str__(self):
        return self.text

    class Meta:
        verbose_name = "Пользовательский вариант"
        verbose_name_plural = "Пользовательские варианты"



# Create your models here.
