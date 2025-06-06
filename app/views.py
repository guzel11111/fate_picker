from django.shortcuts import render, redirect
from .models import DecisionCategory, Option, UserChoiceSession, UserCustomOption
from django.contrib.auth import login, logout
from .forms import RegisterForm, LoginForm
from django.contrib.auth import get_user_model
User = get_user_model()
from django.contrib.auth.forms import UserCreationForm

def register_view(request):
    if request.method == "POST":
        form = RegisterForm(request.POST)
        if form.is_valid():
            user = User.objects.create_user(
                username=form.cleaned_data['username'],
                email=form.cleaned_data['email'],
                password=form.cleaned_data['password'],
            )
            login(request, user)  # сразу залогиним нового пользователя
            return redirect('index')  # после регистрации на главную
    else:
        form = RegisterForm()
    return render(request, 'register.html', {'form': form})

def login_view(request):
    if request.method == "POST":
        form = LoginForm(request.POST)
        if form.is_valid():
            user = form.user
            login(request, user)  # залогиним пользователя
            return redirect('index')  # после входа на главную
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
        category_id = request.POST.get("category")
        options_text = request.POST.get("options")

        options = []

        if method == "coin":
            options = ["Орёл", "Решка"]
        elif method == "yesno":
            options = ["Да", "Нет"]
        elif method in ["wheel", "drum", "custom"]:
            if category_id:
                try:
                    cat = DecisionCategory.objects.get(id=category_id)
                    options = [opt.text for opt in cat.options.all()]
                except DecisionCategory.DoesNotExist:
                    pass
            elif options_text:
                options = [x.strip() for x in options_text.split(",") if x.strip()]

        if options:
            result = random.choice(options)

            # Сохраняем сессию пользователя
            if request.user.is_authenticated:
                session = UserChoiceSession.objects.create(
                    user=request.user,
                    method=method,
                    category_id=category_id if category_id else None,
                    result=result,
                )
                if method == "custom" and options_text:
                    for val in options:
                        UserCustomOption.objects.create(session=session, text=val)

    context = {
        "categories": DecisionCategory.objects.filter(is_active=True),
        "result": result
    }
    return render(request, "index.html", context)


# Create your views here.
