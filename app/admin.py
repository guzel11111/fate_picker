from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, DecisionCategory, Option, UserChoiceSession, UserCustomOption

# Регистрация кастомного пользователя
admin.site.register(CustomUser, UserAdmin)

# Админка для категории решений
class DecisionCategoryAdmin(admin.ModelAdmin):
    prepopulated_fields = {"slug": ("name",)}

# Админка для вариантов
class OptionAdmin(admin.ModelAdmin):
    pass

# Админка для пользовательских сессий выбора
class UserChoiceSessionAdmin(admin.ModelAdmin):
    pass

# Админка для пользовательских вариантов в сессии
class UserCustomOptionAdmin(admin.ModelAdmin):
    pass

# Регистрация моделей
admin.site.register(DecisionCategory, DecisionCategoryAdmin)
admin.site.register(Option, OptionAdmin)
admin.site.register(UserChoiceSession, UserChoiceSessionAdmin)
admin.site.register(UserCustomOption, UserCustomOptionAdmin)