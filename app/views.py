from django.shortcuts import render, redirect
from django.contrib.auth import login, logout
from django.contrib.auth import get_user_model
from .forms import RegisterForm, LoginForm
import random
from django.shortcuts import render
from .models import DecisionCategory, Option, UserChoiceSession
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse

def coin_view(request):
    return render(request, 'coin.html')

def dice_view(request):
    return render(request, 'dice.html')

def wheel_view(request):
    # Проверяем, есть ли категории
    if not DecisionCategory.objects.exists():
        # Создаем тестовые категории
        food_category = DecisionCategory.objects.create(
            name="Еда",
            is_active=True
        )
        Option.objects.create(category=food_category, text="Пицца")
        Option.objects.create(category=food_category, text="Суши")
        Option.objects.create(category=food_category, text="Бургер")
        Option.objects.create(category=food_category, text="Паста")

        movies_category = DecisionCategory.objects.create(
            name="Фильмы",
            is_active=True
        )
        Option.objects.create(category=movies_category, text="Комедия")
        Option.objects.create(category=movies_category, text="Драма")
        Option.objects.create(category=movies_category, text="Боевик")
        Option.objects.create(category=movies_category, text="Ужасы")

    categories = DecisionCategory.objects.filter(is_active=True).prefetch_related('options')
    
    # Отладочная информация
    print("\n=== Categories Debug Info ===")
    for category in categories:
        options = list(category.options.all())
        print(f"\nCategory: {category.name} (ID: {category.id})")
        print(f"Options count: {len(options)}")
        print("Options:")
        for opt in options:
            print(f"  - {opt.text} (id={opt.id}, category_id={opt.category_id})")
    print("===========================\n")

    return render(request, 'fortune_wheel.html', {'categories': categories})

User = get_user_model()

def register_view(request):
    if request.method == "POST":
        form = RegisterForm(request.POST)
        if form.is_valid():
            user = User.objects.create_user(
                username=form.cleaned_data['username'],
                email=form.cleaned_data['email'],
                password=form.cleaned_data['password'],
            )
            login(request, user)
            return redirect('index')
    else:
        form = RegisterForm()
    return render(request, 'register.html', {'form': form})

def login_view(request):
    if request.method == "POST":
        form = LoginForm(request.POST)
        if form.is_valid():
            user = form.user
            login(request, user)
            return redirect('index')
    else:
        form = LoginForm()
    return render(request, 'login.html', {'form': form})

def logout_view(request):
    logout(request)
    return redirect('index')

def home_view(request):
    result = None

    if request.method == "POST":
        method = request.POST.get("method")

        if method == "coin":
            result = random.choice(["Орёл", "Решка"])
        elif method == "dice":
            result = str(random.randint(1, 6))
        elif method == "wheel":
            options = ["Вариант 1", "Вариант 2", "Вариант 3", "Вариант 4"]
            result = random.choice(options)

    return render(request, "index.html", {"result": result})

@login_required
def history_view(request):
    sessions = UserChoiceSession.objects.filter(user=request.user)
    date_from = request.GET.get('date_from')
    date_to = request.GET.get('date_to')
    if date_from:
        sessions = sessions.filter(created_at__date__gte=date_from)
    if date_to:
        sessions = sessions.filter(created_at__date__lte=date_to)
    
    # Добавляем пагинацию
    page = int(request.GET.get('page', 1))
    per_page = 5  # количество записей на странице
    total_count = sessions.count()
    sessions = sessions.order_by('-created_at')[(page-1)*per_page:page*per_page]
    
    has_more = total_count > page * per_page
    
    return render(request, 'history.html', {
        'sessions': sessions,
        'has_more': has_more,
        'next_page': page + 1 if has_more else None
    })

@csrf_exempt
def save_history_api(request):
    print("\n=== Save History API Debug Info ===")
    print(f"Method: {request.method}")
    print(f"User authenticated: {request.user.is_authenticated}")
    if request.method == 'POST' and request.user.is_authenticated:
        import json
        data = json.loads(request.body.decode('utf-8'))
        print(f"Received data: {data}")
        method = data.get('method')
        result = data.get('result')
        category_id = data.get('category_id')
        category = None
        if category_id:
            from .models import DecisionCategory
            try:
                category = DecisionCategory.objects.get(id=category_id)
            except DecisionCategory.DoesNotExist:
                category = None
        session = UserChoiceSession.objects.create(
            user=request.user,
            method=method,
            result=result,
            category=category
        )
        print(f"Created session: {session}")
        print("===========================\n")
        return JsonResponse({'status': 'ok'})
    print("===========================\n")
    return JsonResponse({'status': 'error', 'message': 'not authenticated or not POST'})

# Create your views here.
