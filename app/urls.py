from django.urls import path
from . import views

urlpatterns = [
    path('', views.home_view, name='index'),  # главная страница
    path('register/', views.register_view, name='register'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),  # <-- здесь
]


