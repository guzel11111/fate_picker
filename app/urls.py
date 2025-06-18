from django.urls import path
from . import views

urlpatterns = [
    path('', views.home_view, name='index'),  # главная страница
    path('register/', views.register_view, name='register'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('coin/', views.coin_view, name='coin'),    # монетка
    path('dice/', views.dice_view, name='dice'),    # кубик
    path('wheel/', views.wheel_view, name='wheel'),  # <-- здесь
    path('history/', views.history_view, name='history'),
    path('api/save_history/', views.save_history_api, name='save_history_api'),
    path('api/save_custom_options/', views.save_custom_options_api, name='save_custom_options_api'),
    path('api/save_user_category/', views.save_user_category_api, name='save_user_category_api'),
    path('api/delete_user_category/', views.delete_user_category_api, name='delete_user_category_api'),
    path('api/edit_user_category/', views.edit_user_category_api, name='edit_user_category_api'),
]





