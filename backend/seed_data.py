import os
import django

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth import get_user_model
from quizzes.models import Quiz, Question, Option

User = get_user_model()

def seed():
    print("Seeding database...")
    
    # 1. Create Student User: yasheswani
    student, created = User.objects.get_or_create(
        username='yasheswani',
        defaults={
            'email': 'yasheswani@example.com',
            'role': 'STUDENT',
            'is_active': True
        }
    )
    if created or not student.check_password('yasheswani'):
        student.set_password('yasheswani')
        student.save()
        print("Student user 'yasheswani' created/updated.")
    else:
        print("Student user 'yasheswani' already exists.")
        
    # 2. Create Admin User: admin
    admin, created = User.objects.get_or_create(
        username='admin',
        defaults={
            'email': 'admin@example.com',
            'role': 'ADMIN',
            'is_superuser': True,
            'is_staff': True,
            'is_active': True
        }
    )
    if created or not admin.check_password('adminpassword'):
        admin.set_password('adminpassword')
        admin.save()
        print("Admin user 'admin' created/updated.")
    else:
        print("Admin user 'admin' already exists.")

    # 3. Create Sample Quizzes if they don't exist
    if not Quiz.objects.exists():
        # Quiz 1
        quiz1 = Quiz.objects.create(
            title='Web Development Basics',
            description='Test your knowledge of HTML, CSS, and Javascript.',
            category_name='Technology',
            duration=10,
            passing_score=60,
            difficulty='Beginner',
            status='PUBLISHED'
        )
        
        q1 = Question.objects.create(quiz=quiz1, text='What does HTML stand for?')
        Option.objects.create(question=q1, text='Hyper Text Markup Language', is_correct=True)
        Option.objects.create(question=q1, text='High Text Markup Language', is_correct=False)
        Option.objects.create(question=q1, text='Hyper Tabular Markup Language', is_correct=False)
        Option.objects.create(question=q1, text='Hypertext Markdown Language', is_correct=False)
        
        q2 = Question.objects.create(quiz=quiz1, text='Which CSS property controls the text size?')
        Option.objects.create(question=q2, text='font-size', is_correct=True)
        Option.objects.create(question=q2, text='text-size', is_correct=False)
        Option.objects.create(question=q2, text='font-style', is_correct=False)
        Option.objects.create(question=q2, text='size', is_correct=False)
        
        q3 = Question.objects.create(quiz=quiz1, text='Which of the following is NOT a JavaScript framework or library?')
        Option.objects.create(question=q3, text='Django', is_correct=True)
        Option.objects.create(question=q3, text='React', is_correct=False)
        Option.objects.create(question=q3, text='Vue', is_correct=False)
        Option.objects.create(question=q3, text='Angular', is_correct=False)

        # Quiz 2
        quiz2 = Quiz.objects.create(
            title='Python Programming',
            description='Intermediate Python programming concepts and features.',
            category_name='Programming',
            duration=15,
            passing_score=70,
            difficulty='Intermediate',
            status='PUBLISHED'
        )
        
        q4 = Question.objects.create(quiz=quiz2, text='Which keyword is used to define a function in Python?')
        Option.objects.create(question=q4, text='def', is_correct=True)
        Option.objects.create(question=q4, text='function', is_correct=False)
        Option.objects.create(question=q4, text='func', is_correct=False)
        Option.objects.create(question=q4, text='define', is_correct=False)
        
        q5 = Question.objects.create(quiz=quiz2, text='What is the correct way to write an empty function in Python?')
        Option.objects.create(question=q5, text='pass', is_correct=True)
        Option.objects.create(question=q5, text='return', is_correct=False)
        Option.objects.create(question=q5, text='null', is_correct=False)
        Option.objects.create(question=q5, text='void', is_correct=False)
        
        print("Sample quizzes seeded successfully.")
    else:
        print("Quizzes already exist in the database.")

if __name__ == '__main__':
    seed()
