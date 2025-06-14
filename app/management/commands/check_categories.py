from django.core.management.base import BaseCommand
from app.models import DecisionCategory, Option

class Command(BaseCommand):
    help = 'Check existing categories and options'

    def handle(self, *args, **kwargs):
        categories = DecisionCategory.objects.all()
        if not categories.exists():
            self.stdout.write(self.style.WARNING('No categories found in database'))
            return

        for category in categories:
            self.stdout.write(f"\nCategory: {category.name} (ID: {category.id})")
            options = category.options.all()
            if not options.exists():
                self.stdout.write(self.style.WARNING(f'  No options found for category {category.name}'))
            else:
                for option in options:
                    self.stdout.write(f'  - {option.text}') 