from fastapi import FastAPI, Depends, HTTPException, status, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import engine, Base, get_db
import models
from datetime import datetime, date
import json
import time

# --- SCHEMAS ---
class LoginRequest(BaseModel):
    email: str
    password: str

class UserCreate(BaseModel):
    email: str
    password: str
    name: str
    age: int = 0
    english_level: str | None = None
    motivation: str | None = None
    daily_goal_min: int | None = None

class ProfileUpdate(BaseModel):
    # email: str | None = None # Removing mandatory email since we use token
    email: str | None = None
    new_email: str | None = None
    name: str | None = None
    age: int | None = None
    password: str | None = None
    avatar: str | None = None
    theme: str | None = None
    
    # Campos que el FRONTEND usa y hoy no persisten:
    xp: int | None = None
    credits: int | None = None  # backend: credits
    streak: int | None = None
    inventory: list[str] | None = None
    
    placementTestCompleted: bool | None = None
    unlockedLevelIndex: int | None = None
    level: str | None = None
    
    # Onboarding updates
    english_level: str | None = None
    motivation: str | None = None
    daily_goal_min: int | None = None
    activeBadge: str | None = None

class MissionSubmit(BaseModel):
    score: float # 0-100
    answers: dict | None = None # Optional payload

# --- APP SETUP ---

# CRITICAL: Create tables before app startup to avoid "no such table" errors
Base.metadata.create_all(bind=engine)

app = FastAPI()

# CORS: Allow local dev and production explicitly
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://ingles-genius-pro.vercel.app",
    "https://inglesgeniuspro.com",
    "https://www.inglesgeniuspro.com"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- SEEDING LOGIC ---
# ... (seeding logic remains unchanged, skipping for brevity in replacement if possible, but tool requires contiguous block. Only replacing relevant section) ...
# To minimize token usage, I will target the updated parts only if they are contiguous enough. They are not.
# I will replace from SCHEMAS down to update_profile to be safe, but that is huge.
# Let's try replacing JUST the schemas and then JUST the update_profile endpoint in separate tool calls if needed, OR one big one if they are close.
# They are far apart (lines 11-37 vs 353-417).
# I will do two edits.

# Edit 1: Schemas


# --- SEEDING LOGIC ---
def seed_courses(db: Session):
    # Idempotent check removed to allow updates
    # if db.query(models.Course).first():
    #    return

    print("Seeding Courses, Tracks, and Missions...")
    
    courses_data = [
        {"title": "Inglés Básico", "level": "A1", "desc": "Fundamentos para empezar tu viaje."},
        {"title": "Inglés Intermedio", "level": "A2/B1", "desc": "Expande tus horizontes."},
        {"title": "Inglés Avanzado", "level": "B2", "desc": "Domina el universo."}
    ]
    
    track_types = [
        {"key": "vocabulary", "title": "Vocabulary Orbit", "color": "#4F46E5"},
        {"key": "grammar", "title": "Grammar System", "color": "#10B981"},
        {"key": "listening", "title": "Listening Moon", "color": "#F59E0B"},
        {"key": "speaking", "title": "Speaking Missions", "color": "#EC4899"}
    ]

    # Content Banks (Expanded for 40 Unique Missions)
    vocab_content = [
        # --- BASIC (0-29) ---
        {"word": "Hello", "translation": "Hola", "emoji": "👋", "options": ["Hola", "Adiós", "Perro"], "correct": "Hola"},
        {"word": "Family", "translation": "Familia", "emoji": "👨‍👩‍👧‍👦", "options": ["Familia", "Amigo", "Casa"], "correct": "Familia"},
        {"word": "Apple", "translation": "Manzana", "emoji": "🍎", "options": ["Pera", "Manzana", "Uva"], "correct": "Manzana"},
        {"word": "Blue", "translation": "Azul", "emoji": "🔵", "options": ["Rojo", "Verde", "Azul"], "correct": "Azul"},
        {"word": "Dog", "translation": "Perro", "emoji": "🐶", "options": ["Gato", "Perro", "Pájaro"], "correct": "Perro"},
        {"word": "House", "translation": "Casa", "emoji": "🏠", "options": ["Coche", "Casa", "Escuela"], "correct": "Casa"},
        {"word": "Water", "translation": "Agua", "emoji": "💧", "options": ["Fuego", "Agua", "Tierra"], "correct": "Agua"},
        {"word": "Time", "translation": "Tiempo", "emoji": "⏰", "options": ["Reloj", "Tiempo", "Dinero"], "correct": "Tiempo"},
        {"word": "Happy", "translation": "Feliz", "emoji": "😊", "options": ["Triste", "Feliz", "Enojado"], "correct": "Feliz"},
        {"word": "Run", "translation": "Correr", "emoji": "🏃", "options": ["Caminar", "Correr", "Saltar"], "correct": "Correr"},
        {"word": "Cat", "translation": "Gato", "emoji": "🐱", "options": ["Perro", "Gato", "Ratón"], "correct": "Gato"},
        {"word": "Red", "translation": "Rojo", "emoji": "🔴", "options": ["Azul", "Rojo", "Verde"], "correct": "Rojo"},
        {"word": "Sun", "translation": "Sol", "emoji": "☀️", "options": ["Luna", "Sol", "Estrella"], "correct": "Sol"},
        {"word": "Moon", "translation": "Luna", "emoji": "🌙", "options": ["Sol", "Luna", "Cielo"], "correct": "Luna"},
        {"word": "Book", "translation": "Libro", "emoji": "📚", "options": ["Lápiz", "Libro", "Mesa"], "correct": "Libro"},
        {"word": "Pen", "translation": "Bolígrafo", "emoji": "🖊️", "options": ["Papel", "Bolígrafo", "Goma"], "correct": "Bolígrafo"},
        {"word": "Friend", "translation": "Amigo", "emoji": "🤝", "options": ["Enemigo", "Amigo", "Desconocido"], "correct": "Amigo"},
        {"word": "Love", "translation": "Amor", "emoji": "❤️", "options": ["Odio", "Amor", "Paz"], "correct": "Amor"},
        {"word": "Eat", "translation": "Comer", "emoji": "🍽️", "options": ["Beber", "Comer", "Dormir"], "correct": "Comer"},
        {"word": "Sleep", "translation": "Dormir", "emoji": "😴", "options": ["Correr", "Dormir", "Despertar"], "correct": "Dormir"},
        {"word": "Car", "translation": "Coche", "emoji": "🚗", "options": ["Avión", "Coche", "Barco"], "correct": "Coche"},
        {"word": "Tree", "translation": "Árbol", "emoji": "🌳", "options": ["Flor", "Árbol", "Hierba"], "correct": "Árbol"},
        {"word": "Flower", "translation": "Flor", "emoji": "🌸", "options": ["Árbol", "Flor", "Hoja"], "correct": "Flor"},
        {"word": "Bird", "translation": "Pájaro", "emoji": "🐦", "options": ["Pez", "Pájaro", "Gato"], "correct": "Pájaro"},
        {"word": "Fish", "translation": "Pez", "emoji": "🐟", "options": ["Pájaro", "Pez", "Perro"], "correct": "Pez"},
        {"word": "Milk", "translation": "Leche", "emoji": "🥛", "options": ["Agua", "Leche", "Jugo"], "correct": "Leche"},
        {"word": "Bread", "translation": "Pan", "emoji": "🍞", "options": ["Carne", "Pan", "Fruta"], "correct": "Pan"},
        {"word": "Cheese", "translation": "Queso", "emoji": "🧀", "options": ["Pan", "Queso", "Leche"], "correct": "Queso"},
        {"word": "School", "translation": "Escuela", "emoji": "🏫", "options": ["Casa", "Escuela", "Parque"], "correct": "Escuela"},
        {"word": "Computer", "translation": "Computadora", "emoji": "💻", "options": ["Teléfono", "Computadora", "TV"], "correct": "Computadora"},
        
        # --- INTERMEDIATE (30-59) ---
        {"word": "Journey", "translation": "Viaje", "emoji": "✈️", "options": ["Viaje", "Hogar", "Trabajo"], "correct": "Viaje"},
        {"word": "Meeting", "translation": "Reunión", "emoji": "🤝", "options": ["Fiesta", "Reunión", "Cita"], "correct": "Reunión"},
        {"word": "Available", "translation": "Disponible", "emoji": "✅", "options": ["Ocupado", "Disponible", "Cerrado"], "correct": "Disponible"},
        {"word": "Success", "translation": "Éxito", "emoji": "🏆", "options": ["Fracaso", "Éxito", "Suerte"], "correct": "Éxito"},
        {"word": "Challenge", "translation": "Desafío", "emoji": "🧗", "options": ["Fácil", "Desafío", "Juego"], "correct": "Desafío"},
        {"word": "Advice", "translation": "Consejo", "emoji": "💡", "options": ["Orden", "Consejo", "Pregunta"], "correct": "Consejo"},
        {"word": "Decision", "translation": "Decisión", "emoji": "⚖️", "options": ["Duda", "Decisión", "Error"], "correct": "Decisión"},
        {"word": "Goal", "translation": "Meta", "emoji": "🎯", "options": ["Inicio", "Meta", "Camino"], "correct": "Meta"},
        {"word": "Skill", "translation": "Habilidad", "emoji": "🛠️", "options": ["Defecto", "Habilidad", "Suerte"], "correct": "Habilidad"},
        {"word": "Team", "translation": "Equipo", "emoji": "👥", "options": ["Solo", "Equipo", "Jefe"], "correct": "Equipo"},
        {"word": "Improve", "translation": "Mejorar", "emoji": "📈", "options": ["Empeorar", "Mejorar", "Mantener"], "correct": "Mejorar"},
        {"word": "Schedule", "translation": "Horario", "emoji": "📅", "options": ["Reloj", "Horario", "Mapa"], "correct": "Horario"},
        {"word": "Customer", "translation": "Cliente", "emoji": "🛍️", "options": ["Vendedor", "Cliente", "Producto"], "correct": "Cliente"},
        {"word": "Product", "translation": "Producto", "emoji": "📦", "options": ["Servicio", "Producto", "Precio"], "correct": "Producto"},
        {"word": "Price", "translation": "Precio", "emoji": "🏷️", "options": ["Gratis", "Precio", "Descuento"], "correct": "Precio"},
        {"word": "Offer", "translation": "Oferta", "emoji": "🎁", "options": ["Demanda", "Oferta", "Regalo"], "correct": "Oferta"},
        {"word": "Agreement", "translation": "Acuerdo", "emoji": "📝", "options": ["Disputa", "Acuerdo", "Duda"], "correct": "Acuerdo"},
        {"word": "Contract", "translation": "Contrato", "emoji": "📄", "options": ["Carta", "Contrato", "Recibo"], "correct": "Contrato"},
        {"word": "Employee", "translation": "Empleado", "emoji": "👷", "options": ["Jefe", "Empleado", "Dueño"], "correct": "Empleado"},
        {"word": "Manager", "translation": "Gerente", "emoji": "👔", "options": ["Gerente", "Asistente", "Cliente"], "correct": "Gerente"},
        {"word": "Salary", "translation": "Salario", "emoji": "💰", "options": ["Gasto", "Salario", "Deuda"], "correct": "Salario"},
        {"word": "Office", "translation": "Oficina", "emoji": "🏢", "options": ["Casa", "Oficina", "Parque"], "correct": "Oficina"},
        {"word": "Project", "translation": "Proyecto", "emoji": "📊", "options": ["Idea", "Proyecto", "Sueño"], "correct": "Proyecto"},
        {"word": "Deadline", "translation": "Fecha lìmite", "emoji": "⏳", "options": ["Inicio", "Fecha lìmite", "Pausa"], "correct": "Fecha lìmite"},
        {"word": "Report", "translation": "Informe", "emoji": "📑", "options": ["Libro", "Informe", "Nota"], "correct": "Informe"},
        {"word": "Presentation", "translation": "Presentación", "emoji": "📽️", "options": ["Charla", "Presentación", "Video"], "correct": "Presentación"},
        {"word": "Strategy", "translation": "Estrategia", "emoji": "♟️", "options": ["Suerte", "Estrategia", "Juego"], "correct": "Estrategia"},
        {"word": "Growth", "translation": "Crecimiento", "emoji": "🌱", "options": ["Caída", "Crecimiento", "Estabilidad"], "correct": "Crecimiento"},
        {"word": "Market", "translation": "Mercado", "emoji": "🌍", "options": ["Tienda", "Mercado", "Calle"], "correct": "Mercado"},
        {"word": "Business", "translation": "Negocio", "emoji": "💼", "options": ["Placer", "Negocio", "Hobby"], "correct": "Negocio"},
        
        # --- ADVANCED (60-89) ---
        {"word": "Endeavor", "translation": "Esfuerzo", "emoji": "🏔️", "options": ["Descanso", "Esfuerzo", "Facilidad"], "correct": "Esfuerzo"},
        {"word": "Mitigate", "translation": "Mitigar", "emoji": "🛡️", "options": ["Empeorar", "Mitigar", "Ignorar"], "correct": "Mitigar"},
        {"word": "Paradox", "translation": "Paradoja", "emoji": "🌀", "options": ["Verdad", "Paradoja", "Mentira"], "correct": "Paradoja"},
        {"word": "Resilient", "translation": "Resiliente", "emoji": "🎍", "options": ["Débil", "Resiliente", "Frágil"], "correct": "Resiliente"},
        {"word": "Ambiguous", "translation": "Ambiguo", "emoji": "🌫️", "options": ["Claro", "Ambiguo", "Obvio"], "correct": "Ambiguo"},
        {"word": "Hypothesis", "translation": "Hipótesis", "emoji": "🧪", "options": ["Hecho", "Hipótesis", "Ley"], "correct": "Hipótesis"},
        {"word": "Inevitable", "translation": "Inevitable", "emoji": "⚡", "options": ["Posible", "Inevitable", "Evitable"], "correct": "Inevitable"},
        {"word": "Eloquent", "translation": "Elocuente", "emoji": "🗣️", "options": ["Mudo", "Elocuente", "Torpe"], "correct": "Elocuente"},
        {"word": "Lucid", "translation": "Lúcido", "emoji": "💡", "options": ["Confuso", "Lúcido", "Oscuro"], "correct": "Lúcido"},
        {"word": "Pragmatic", "translation": "Pragmático", "emoji": "🔧", "options": ["Idealista", "Pragmático", "Soñador"], "correct": "Pragmático"},
        {"word": "Cognitive", "translation": "Cognitivo", "emoji": "🧠", "options": ["Físico", "Cognitivo", "Emocional"], "correct": "Cognitivo"},
        {"word": "Empathy", "translation": "Empatía", "emoji": "❤️", "options": ["Apatía", "Empatía", "Ira"], "correct": "Empatía"},
        {"word": "Innovation", "translation": "Innovación", "emoji": "🚀", "options": ["Tradición", "Innovación", "Copia"], "correct": "Innovación"},
        {"word": "Perspective", "translation": "Perspectiva", "emoji": "👁️", "options": ["Ceguera", "Perspectiva", "Lado"], "correct": "Perspectiva"},
        {"word": "Sustainable", "translation": "Sostenible", "emoji": "♻️", "options": ["Dañino", "Sostenible", "Temporal"], "correct": "Sostenible"},
        {"word": "Authentic", "translation": "Auténtico", "emoji": "🆔", "options": ["Falso", "Auténtico", "Copia"], "correct": "Auténtico"},
        {"word": "Compromise", "translation": "Compromiso", "emoji": "🤝", "options": ["Pelea", "Compromiso", "Huida"], "correct": "Compromiso"},
        {"word": "Dilemma", "translation": "Dilema", "emoji": "🤷", "options": ["Solución", "Dilema", "Certeza"], "correct": "Dilema"},
        {"word": "Efficient", "translation": "Eficiente", "emoji": "⚡", "options": ["Lento", "Eficiente", "Costoso"], "correct": "Eficiente"},
        {"word": "Flexible", "translation": "Flexible", "emoji": "🤸", "options": ["Rígido", "Flexible", "Duro"], "correct": "Flexible"},
        {"word": "Genuine", "translation": "Genuino", "emoji": "💎", "options": ["Artificial", "Genuino", "Sintético"], "correct": "Genuino"},
        {"word": "Harmony", "translation": "Armonía", "emoji": "🎶", "options": ["Caos", "Armonía", "Ruido"], "correct": "Armonía"},
        {"word": "Intuition", "translation": "Intuición", "emoji": "🔮", "options": ["Razón", "Intuición", "Duda"], "correct": "Intuición"},
        {"word": "Justify", "translation": "Justificar", "emoji": "⚖️", "options": ["Acusar", "Justificar", "Negar"], "correct": "Justificar"},
        {"word": "Kinetic", "translation": "Cinético", "emoji": "🏃", "options": ["Estático", "Cinético", "Quieto"], "correct": "Cinético"},
        {"word": "Liability", "translation": "Responsabilidad", "emoji": "📜", "options": ["Ventaja", "Responsabilidad", "Activo"], "correct": "Responsabilidad"},
        {"word": "Momentum", "translation": "Ímpetu", "emoji": "🚅", "options": ["Freno", "Ímpetu", "Pausa"], "correct": "Ímpetu"},
        {"word": "Nuance", "translation": "Matiz", "emoji": "🎨", "options": ["Blanco", "Matiz", "Todo"], "correct": "Matiz"},
        {"word": "Optimist", "translation": "Optimista", "emoji": "😊", "options": ["Pesimista", "Optimista", "Realista"], "correct": "Optimista"},
        {"word": "Plausible", "translation": "Plausible", "emoji": "🤔", "options": ["Impossible", "Plausible", "Falso"], "correct": "Plausible"},
    ]
    
    grammar_content = [
        # --- BASIC (0-29) ---
        {"question": "I ___ a student.", "options": ["am", "is", "are"], "correct": "am"},
        {"question": "She ___ happy.", "options": ["am", "is", "are"], "correct": "is"},
        {"question": "They ___ eating.", "options": ["am", "is", "are"], "correct": "are"},
        {"question": "We ___ friends.", "options": ["am", "is", "are"], "correct": "are"},
        {"question": "He ___ a doctor.", "options": ["am", "is", "are"], "correct": "is"},
        {"question": "You ___ tall.", "options": ["am", "is", "are"], "correct": "are"},
        {"question": "It ___ a cat.", "options": ["am", "is", "are"], "correct": "is"},
        {"question": "___ you ready?", "options": ["Am", "Is", "Are"], "correct": "Are"},
        {"question": "___ she nice?", "options": ["Am", "Is", "Are"], "correct": "Is"},
        {"question": "I ___ not sad.", "options": ["am", "is", "are"], "correct": "am"},
        {"question": "The sun ___ hot.", "options": ["are", "is", "am"], "correct": "is"},
        {"question": "Dogs ___ loyal.", "options": ["is", "are", "am"], "correct": "are"},
        {"question": "I ___ hungry.", "options": ["is", "am", "are"], "correct": "am"},
        {"question": "He ___ playing.", "options": ["is", "are", "am"], "correct": "is"},
        {"question": "We ___ family.", "options": ["is", "are", "am"], "correct": "are"},
        {"question": "The sky ___ blue.", "options": ["are", "is", "am"], "correct": "is"},
        {"question": "Books ___ good.", "options": ["is", "are", "am"], "correct": "are"},
        {"question": "She ___ smart.", "options": ["is", "are", "am"], "correct": "is"},
        {"question": "They ___ running.", "options": ["is", "are", "am"], "correct": "are"},
        {"question": "It ___ cold.", "options": ["are", "is", "am"], "correct": "is"},
        {"question": "___ they here?", "options": ["Is", "Are", "Am"], "correct": "Are"},
        {"question": "___ he fast?", "options": ["Is", "Are", "Am"], "correct": "Is"},
        {"question": "___ I late?", "options": ["Is", "Am", "Are"], "correct": "Am"},
        {"question": "You ___ kind.", "options": ["is", "are", "am"], "correct": "are"},
        {"question": "The cat ___ small.", "options": ["is", "are", "am"], "correct": "is"},
        {"question": "Cars ___ fast.", "options": ["is", "are", "am"], "correct": "are"},
        {"question": "My mom ___ nice.", "options": ["is", "are", "am"], "correct": "is"},
        {"question": "We ___ students.", "options": ["is", "are", "am"], "correct": "are"},
        {"question": "He ___ tired.", "options": ["is", "are", "am"], "correct": "is"},
        {"question": "I ___ working.", "options": ["is", "am", "are"], "correct": "am"},
        
        # --- INTERMEDIATE (30-59) ---
        {"question": "I ___ watching TV when you called.", "options": ["was", "were", "am"], "correct": "was"},
        {"question": "They ___ playing soccer yesterday at 5.", "options": ["was", "were", "are"], "correct": "were"},
        {"question": "She ___ going to travel tomorrow.", "options": ["will", "is", "go"], "correct": "is"},
        {"question": "We ___ visit you next week.", "options": ["going to", "will", "are"], "correct": "will"},
        {"question": "You ___ study harder.", "options": ["should", "can", "may"], "correct": "should"},
        {"question": "He ___ swim very well.", "options": ["can", "should", "must"], "correct": "can"},
        {"question": "___ I help you?", "options": ["May", "Should", "Must"], "correct": "May"},
        {"question": "You ___ stop at red lights.", "options": ["can", "must", "may"], "correct": "must"},
        {"question": "If it rains, I ___ stay home.", "options": ["will", "would", "am"], "correct": "will"},
        {"question": "She asks ___ help.", "options": ["for", "to", "at"], "correct": "for"},
        {"question": "I am interested ___ music.", "options": ["on", "in", "at"], "correct": "in"},
        {"question": "He is good ___ math.", "options": ["at", "on", "in"], "correct": "at"},
        {"question": "I have ___ here for two years.", "options": ["live", "lived", "living"], "correct": "lived"},
        {"question": "She has ___ a cake.", "options": ["make", "made", "making"], "correct": "made"},
        {"question": "We have ___ a movie.", "options": ["see", "saw", "seen"], "correct": "seen"},
        {"question": "He hasn't ___ yet.", "options": ["arrive", "arrived", "arriving"], "correct": "arrived"},
        {"question": "Have you ___ sushi?", "options": ["eat", "ate", "eaten"], "correct": "eaten"},
        {"question": "This is the ___ book.", "options": ["best", "goodest", "better"], "correct": "best"},
        {"question": "She is ___ than him.", "options": ["taller", "tall", "tallest"], "correct": "taller"},
        {"question": "He runs ___ than me.", "options": ["fast", "faster", "fastest"], "correct": "faster"},
        {"question": "I don't have ___ money.", "options": ["some", "any", "no"], "correct": "any"},
        {"question": "Would you like ___ coffee?", "options": ["some", "any", "a"], "correct": "some"},
        {"question": "There isn't ___ milk.", "options": ["much", "many", "some"], "correct": "much"},
        {"question": "How ___ apples?", "options": ["much", "many", "any"], "correct": "many"},
        {"question": "He turned ___ the lights.", "options": ["off", "out", "away"], "correct": "off"},
        {"question": "She looks ___ her keys.", "options": ["for", "at", "to"], "correct": "for"},
        {"question": "Get ___ the bus.", "options": ["on", "in", "at"], "correct": "on"},
        {"question": "___ you like pizza?", "options": ["Do", "Does", "Is"], "correct": "Do"},
        {"question": "___ she work here?", "options": ["Do", "Does", "Is"], "correct": "Does"},
        {"question": "Where ___ you go?", "options": ["did", "do", "done"], "correct": "did"},
        
        # --- ADVANCED (60-89) ---
        {"question": "By the time I arrived, he ___ left.", "options": ["has", "had", "have"], "correct": "had"},
        {"question": "I wish I ___ known better.", "options": ["have", "had", "would"], "correct": "had"},
        {"question": "If I were you, I ___ go.", "options": ["will", "would", "can"], "correct": "would"},
        {"question": "Had I known, I ___ have come.", "options": ["will", "would", "shall"], "correct": "would"},
        {"question": "The work must ___ done by Friday.", "options": ["be", "been", "being"], "correct": "be"},
        {"question": "The cake was ___ by her.", "options": ["bake", "baked", "baking"], "correct": "baked"},
        {"question": "He is said ___ be rich.", "options": ["to", "for", "that"], "correct": "to"},
        {"question": "___ tired, he went to bed.", "options": ["Being", "Been", "Be"], "correct": "Being"},
        {"question": "Though ___, he kept working.", "options": ["exhausted", "exhausting", "exhaust"], "correct": "exhausted"},
        {"question": "Hardly had I sat down ___ the phone rang.", "options": ["when", "than", "if"], "correct": "when"},
        {"question": "No sooner ___ I left than it rained.", "options": ["did", "had", "do"], "correct": "had"},
        {"question": "It's time you ___ home.", "options": ["go", "went", "gone"], "correct": "went"},
        {"question": "I'd rather you ___ smoke here.", "options": ["don't", "didn't", "not"], "correct": "didn't"},
        {"question": "He acts as if he ___ the boss.", "options": ["is", "was", "were"], "correct": "were"},
        {"question": "She speaks ___ she knows.", "options": ["like", "as if", "as"], "correct": "as if"},
        {"question": "Not only ___ smart, but also kind.", "options": ["she is", "is she", "she be"], "correct": "is she"},
        {"question": "Seldom ___ we see such beauty.", "options": ["do", "are", "have"], "correct": "do"},
        {"question": "Rarely ___ he eat cake.", "options": ["does", "do", "is"], "correct": "does"},
        {"question": "Under no circumstances ___ you open this.", "options": ["should", "you should", "you can"], "correct": "should"},
        {"question": "Only then ___ I understand.", "options": ["did", "do", "have"], "correct": "did"},
        {"question": "Let's look ___ the contract.", "options": ["into", "onto", "upto"], "correct": "into"},
        {"question": "He came ___ with a good idea.", "options": ["up", "in", "on"], "correct": "up"},
        {"question": "We ran ___ of gas.", "options": ["out", "off", "away"], "correct": "out"},
        {"question": "I can't put ___ with this noise.", "options": ["up", "in", "on"], "correct": "up"},
        {"question": "He gave ___ smoking.", "options": ["up", "in", "on"], "correct": "up"},
        {"question": "The meeting was called ___.", "options": ["off", "out", "away"], "correct": "off"},
        {"question": "She takes ___ her mother.", "options": ["after", "for", "to"], "correct": "after"},
        {"question": "We look forward ___ seeing you.", "options": ["to", "for", "at"], "correct": "to"},
        {"question": "It depends ___ the weather.", "options": ["on", "of", "in"], "correct": "on"},
        {"question": "I'm used ___ waking up early.", "options": ["to", "for", "in"], "correct": "to"},
    ]
    
    listening_content = [
        # --- BASIC (0-29) ---
        {"audio_text": "Hello, how are you?", "options": ["Hola, ¿cómo estás?", "Adiós", "Buenas noches"], "correct": "Hola, ¿cómo estás?", "transcript": "Hello, how are you?"},
        {"audio_text": "Where is the library?", "options": ["¿Dónde está la biblioteca?", "¿Qué hora es?", "Hola mundo"], "correct": "¿Dónde está la biblioteca?", "transcript": "Where is the library?"},
        {"audio_text": "My name is John.", "options": ["Me llamo John", "Él es John", "Adiós John"], "correct": "Me llamo John", "transcript": "My name is John."},
        {"audio_text": "I like pizza.", "options": ["Me gusta la pizza", "Odio la pizza", "Quiero agua"], "correct": "Me gusta la pizza", "transcript": "I like pizza."},
        {"audio_text": "What time is it?", "options": ["¿Qué hora es?", "¿Dónde estás?", "¿Quién eres?"], "correct": "¿Qué hora es?", "transcript": "What time is it?"},
        {"audio_text": "Impossible is nothing.", "options": ["Nada es imposible", "Todo es posible", "No hagas nada"], "correct": "Nada es imposible", "transcript": "Impossible is nothing."},
        {"audio_text": "Good morning.", "options": ["Buenos días", "Buenas noches", "Hasta luego"], "correct": "Buenos días", "transcript": "Good morning."},
        {"audio_text": "See you later.", "options": ["Nos vemos luego", "Hola", "Bienvenido"], "correct": "Nos vemos luego", "transcript": "See you later."},
        {"audio_text": "Thank you very much.", "options": ["Muchas gracias", "De nada", "Por favor"], "correct": "Muchas gracias", "transcript": "Thank you very much."},
        {"audio_text": "Do you speak English?", "options": ["¿Hablas inglés?", "¿Hablas español?", "¿Entiendes?"], "correct": "¿Hablas inglés?", "transcript": "Do you speak English?"},
        {"audio_text": "I am hungry.", "options": ["Tengo hambre", "Estoy cansado", "Tengo sed"], "correct": "Tengo hambre", "transcript": "I am hungry."},
        {"audio_text": "It is raining.", "options": ["Está lloviendo", "Hace sol", "Es de noche"], "correct": "Está lloviendo", "transcript": "It is raining."},
        {"audio_text": "How old are you?", "options": ["¿Cuántos años tienes?", "¿Cómo estás?", "¿Quién eres?"], "correct": "¿Cuántos años tienes?", "transcript": "How old are you?"},
        {"audio_text": "I live in Spain.", "options": ["Vivo en España", "Soy de España", "Voy a España"], "correct": "Vivo en España", "transcript": "I live in Spain."},
        {"audio_text": "I have a dog.", "options": ["Tengo un perro", "Tengo un gato", "Soy un perro"], "correct": "Tengo un perro", "transcript": "I have a dog."},
        {"audio_text": "Can you help me?", "options": ["¿Puedes ayudarme?", "¿Me ayudas?", "¿Qué haces?"], "correct": "¿Puedes ayudarme?", "transcript": "Can you help me?"},
        {"audio_text": "Where is the bathroom?", "options": ["¿Dónde está el baño?", "¿Dónde está la cocina?", "¿Dónde estás?"], "correct": "¿Dónde está el baño?", "transcript": "Where is the bathroom?"},
        {"audio_text": "I love you.", "options": ["Te amo", "Te odio", "Me gustas"], "correct": "Te amo", "transcript": "I love you."},
        {"audio_text": "Nice to meet you.", "options": ["Mucho gusto", "Adiós", "Hola"], "correct": "Mucho gusto", "transcript": "Nice to meet you."},
        {"audio_text": "Open the door.", "options": ["Abre la puerta", "Cierra la puerta", "Abre la ventana"], "correct": "Abre la puerta", "transcript": "Open the door."},
        {"audio_text": "Close the window.", "options": ["Cierra la ventana", "Abre la ventana", "Mira la ventana"], "correct": "Cierra la ventana", "transcript": "Close the window."},
        {"audio_text": "I need water.", "options": ["Necesito agua", "Quiero agua", "Tengo agua"], "correct": "Necesito agua", "transcript": "I need water."},
        {"audio_text": "She is beautiful.", "options": ["Ella es hermosa", "Ella es alta", "Ella es lista"], "correct": "Ella es hermosa", "transcript": "She is beautiful."},
        {"audio_text": "He is my brother.", "options": ["Él es mi hermano", "Él es mi padre", "Él es mi amigo"], "correct": "Él es mi hermano", "transcript": "He is my brother."},
        {"audio_text": "This is my car.", "options": ["Este es mi coche", "Esta es mi casa", "Este es mi perro"], "correct": "Este es mi coche", "transcript": "This is my car."},
        {"audio_text": "The sky is blue.", "options": ["El cielo es azul", "El mar es azul", "El cielo es gris"], "correct": "El cielo es azul", "transcript": "The sky is blue."},
        {"audio_text": "I don't know.", "options": ["No lo sé", "No entiendo", "No quiero"], "correct": "No lo sé", "transcript": "I don't know."},
        {"audio_text": "Maybe later.", "options": ["Quizás luego", "Ahora no", "Nunca"], "correct": "Quizás luego", "transcript": "Maybe later."},
        {"audio_text": "Please sit down.", "options": ["Por favor siéntate", "Levántate", "Camina"], "correct": "Por favor siéntate", "transcript": "Please sit down."},
        {"audio_text": "Turn left.", "options": ["Gira a la izquierda", "Gira a la derecha", "Sigue recto"], "correct": "Gira a la izquierda", "transcript": "Turn left."},
        
        # --- INTERMEDIATE (30-59) ---
        {"audio_text": "I would like to order.", "options": ["Me gustaría pedir", "Quiero pagar", "Trae la cuenta"], "correct": "Me gustaría pedir", "transcript": "I would like to order."},
        {"audio_text": "Could you repeat that?", "options": ["¿Podrías repetir eso?", "¿Qué dijiste?", "No te oigo"], "correct": "¿Podrías repetir eso?", "transcript": "Could you repeat that?"},
        {"audio_text": "I agree with you.", "options": ["Estoy de acuerdo contigo", "No estoy de acuerdo", "Tal vez"], "correct": "Estoy de acuerdo contigo", "transcript": "I agree with you."},
        {"audio_text": "It depends on the price.", "options": ["Depende del precio", "Es muy caro", "Es barato"], "correct": "Depende del precio", "transcript": "It depends on the price."},
        {"audio_text": "I'm looking for a job.", "options": ["Busco trabajo", "Tengo trabajo", "Odio mi trabajo"], "correct": "Busco trabajo", "transcript": "I'm looking for a job."},
        {"audio_text": "Let's meet at 5.", "options": ["Nos vemos a las 5", "Son las 5", "Tengo 5"], "correct": "Nos vemos a las 5", "transcript": "Let's meet at 5."},
        {"audio_text": "Have you been to Paris?", "options": ["¿Has estado en París?", "¿Vives en París?", "¿Te gusta París?"], "correct": "¿Has estado en París?", "transcript": "Have you been to Paris?"},
        {"audio_text": "I usually wake up early.", "options": ["Suelo levantarme temprano", "Me levanto tarde", "No duermo"], "correct": "Suelo levantarme temprano", "transcript": "I usually wake up early."},
        {"audio_text": "Are you free tonight?", "options": ["¿Estás libre esta noche?", "¿Qué haces hoy?", "¿Vamos a salir?"], "correct": "¿Estás libre esta noche?", "transcript": "Are you free tonight?"},
        {"audio_text": "I think so.", "options": ["Creo que sí", "Creo que no", "No sé"], "correct": "Creo que sí", "transcript": "I think so."},
        {"audio_text": "It doesn't matter.", "options": ["No importa", "Es importante", "Qué pasa"], "correct": "No importa", "transcript": "It doesn't matter."},
        {"audio_text": "Take your time.", "options": ["Tómate tu tiempo", "Rápido", "Llegas tarde"], "correct": "Tómate tu tiempo", "transcript": "Take your time."},
        {"audio_text": "What do you recommend?", "options": ["¿Qué recomiendas?", "¿Qué quieres?", "¿Qué te gusta?"], "correct": "¿Qué recomiendas?", "transcript": "What do you recommend?"},
        {"audio_text": "I have a headache.", "options": ["Me duele la cabeza", "Tengo fiebre", "Estoy enfermo"], "correct": "Me duele la cabeza", "transcript": "I have a headache."},
        {"audio_text": "Don't give up.", "options": ["No te rindas", "Sigue adelante", "Para"], "correct": "No te rindas", "transcript": "Don't give up."},
        {"audio_text": "Keep in touch.", "options": ["Mantente en contacto", "Adiós", "Hasta nunca"], "correct": "Mantente en contacto", "transcript": "Keep in touch."},
        {"audio_text": "I'm just browsing.", "options": ["Solo estoy mirando", "Quiero comprar", "Me voy"], "correct": "Solo estoy mirando", "transcript": "I'm just browsing."},
        {"audio_text": "That sounds great.", "options": ["Suena genial", "Suena mal", "No me gusta"], "correct": "Suena genial", "transcript": "That sounds great."},
        {"audio_text": "I'm not sure.", "options": ["No estoy seguro", "Sé todo", "Claro que sí"], "correct": "No estoy seguro", "transcript": "I'm not sure."},
        {"audio_text": "It's up to you.", "options": ["Depende de ti", "Tú decides", "Como quieras"], "correct": "Depende de ti", "transcript": "It's up to you."},
        {"audio_text": "Can I try it on?", "options": ["¿Puedo probármelo?", "¿Me lo das?", "¿Cuánto es?"], "correct": "¿Puedo probármelo?", "transcript": "Can I try it on?"},
        {"audio_text": "Do you accept card?", "options": ["¿Aceptas tarjeta?", "¿Solo efectivo?", "¿Es gratis?"], "correct": "¿Aceptas tarjeta?", "transcript": "Do you accept card?"},
        {"audio_text": "I'm on my way.", "options": ["Estoy en camino", "Ya llegué", "No voy"], "correct": "Estoy en camino", "transcript": "I'm on my way."},
        {"audio_text": "Long time no see.", "options": ["Cuánto tiempo sin verte", "Hola", "Adiós"], "correct": "Cuánto tiempo sin verte", "transcript": "Long time no see."},
        {"audio_text": "Make yourself at home.", "options": ["Siéntete como en casa", "Vete a casa", "Limpia la casa"], "correct": "Siéntete como en casa", "transcript": "Make yourself at home."},
        {"audio_text": "Mind your step.", "options": ["Cuidado donde pisas", "Camina rápido", "Salta"], "correct": "Cuidado donde pisas", "transcript": "Mind your step."},
        {"audio_text": "Out of order.", "options": ["Fuera de servicio", "En orden", "Funciona"], "correct": "Fuera de servicio", "transcript": "Out of order."},
        {"audio_text": "So far, so good.", "options": ["Hasta ahora, todo bien", "Muy lejos", "Muy bueno"], "correct": "Hasta ahora, todo bien", "transcript": "So far, so good."},
        {"audio_text": "Take care.", "options": ["Cuídate", "Adiós", "Suerte"], "correct": "Cuídate", "transcript": "Take care."},
        {"audio_text": "What a pity!", "options": ["¡Qué pena!", "¡Qué bien!", "¡Qué sorpresa!"], "correct": "¡Qué pena!", "transcript": "What a pity!"},
        
        # --- ADVANCED (60-89) ---
        {"audio_text": "I beg to differ.", "options": ["Permíteme discrepar", "Estoy de acuerdo", "Por favor"], "correct": "Permíteme discrepar", "transcript": "I beg to differ."},
        {"audio_text": "It's a piece of cake.", "options": ["Es pan comido", "Es un pastel", "Es difícil"], "correct": "Es pan comido", "transcript": "It's a piece of cake."},
        {"audio_text": "Don't beat around the bush.", "options": ["No te andes con rodeos", "Golpea el arbusto", "Habla claro"], "correct": "No te andes con rodeos", "transcript": "Don't beat around the bush."},
        {"audio_text": "Better late than never.", "options": ["Más vale tarde que nunca", "Nunca llegues tarde", "Mejor no ir"], "correct": "Más vale tarde que nunca", "transcript": "Better late than never."},
        {"audio_text": "Break a leg!", "options": ["¡Buena suerte!", "¡Rómpete una pierna!", "¡Ten cuidado!"], "correct": "¡Buena suerte!", "transcript": "Break a leg!"},
        {"audio_text": "Call it a day.", "options": ["Terminar por hoy", "Llamar al día", "Empezar"], "correct": "Terminar por hoy", "transcript": "Call it a day."},
        {"audio_text": "Cut to the chase.", "options": ["Ir al grano", "Cortar la persecución", "Correr"], "correct": "Ir al grano", "transcript": "Cut to the chase."},
        {"audio_text": "Get out of hand.", "options": ["Salirse de control", "Irse de la mano", "Soltar"], "correct": "Salirse de control", "transcript": "Get out of hand."},
        {"audio_text": "Hit the sack.", "options": ["Irse a dormir", "Golpear el saco", "Trabajar"], "correct": "Irse a dormir", "transcript": "Hit the sack."},
        {"audio_text": "It's not rocket science.", "options": ["No es tan difícil", "Es ciencia espacial", "Es un cohete"], "correct": "No es tan difícil", "transcript": "It's not rocket science."},
        {"audio_text": "Let the cat out of the bag.", "options": ["Revelar el secreto", "Sacar al gato", "Perder al gato"], "correct": "Revelar el secreto", "transcript": "Let the cat out of the bag."},
        {"audio_text": "Make a long story short.", "options": ["Resumiendo", "Hacer una historia larga", "Contar todo"], "correct": "Resumiendo", "transcript": "Make a long story short."},
        {"audio_text": "Miss the boat.", "options": ["Perder la oportunidad", "Perder el barco", "Llegar tarde"], "correct": "Perder la oportunidad", "transcript": "Miss the boat."},
        {"audio_text": "No pain, no gain.", "options": ["Sin esfuerzo no hay recompensa", "Sin dolor no hay ganancia", "Duele"], "correct": "Sin esfuerzo no hay recompensa", "transcript": "No pain, no gain."},
        {"audio_text": "On the ball.", "options": ["Atento/Alerta", "En la pelota", "Jugando"], "correct": "Atento/Alerta", "transcript": "On the ball."},
        {"audio_text": "Pull someone's leg.", "options": ["Tomar el pelo", "Jalar la pierna", "Caerse"], "correct": "Tomar el pelo", "transcript": "Pull someone's leg."},
        {"audio_text": "Speak of the devil.", "options": ["Hablando del rey de Roma", "Habla del diablo", "Miedo"], "correct": "Hablando del rey de Roma", "transcript": "Speak of the devil."},
        {"audio_text": "That's the last straw.", "options": ["Es la gota que colma el vaso", "Es la última paja", "Se acabó"], "correct": "Es la gota que colma el vaso", "transcript": "That's the last straw."},
        {"audio_text": "Time flies.", "options": ["El tiempo vuela", "Tiempo de moscas", "Es tarde"], "correct": "El tiempo vuela", "transcript": "Time flies."},
        {"audio_text": "Under the weather.", "options": ["Enfermo/Mal", "Debajo del clima", "Con frío"], "correct": "Enfermo/Mal", "transcript": "Under the weather."},
        {"audio_text": "We see eye to eye.", "options": ["Estamos de acuerdo", "Nos miramos a los ojos", "Vemos bien"], "correct": "Estamos de acuerdo", "transcript": "We see eye to eye."},
        {"audio_text": "A blessing in disguise.", "options": ["No hay mal que por bien no venga", "Una bendición oculta", "Disfraz"], "correct": "No hay mal que por bien no venga", "transcript": "A blessing in disguise."},
        {"audio_text": "A dime a dozen.", "options": ["Muy común", "Una moneda", "Doce"], "correct": "Muy común", "transcript": "A dime a dozen."},
        {"audio_text": "Beat around the bush.", "options": ["Andarse con rodeos", "Golpear el arbusto", "Jugar"], "correct": "Andarse con rodeos", "transcript": "Beat around the bush."},
        {"audio_text": "Bite the bullet.", "options": ["Hacer de tripas corazón", "Morder la bala", "Disparar"], "correct": "Hacer de tripas corazón", "transcript": "Bite the bullet."},
        {"audio_text": "Call it a day.", "options": ["Terminar", "Llamar", "Día"], "correct": "Terminar", "transcript": "Call it a day."},
        {"audio_text": "Cutting corners.", "options": ["Tomar atajos (mal)", "Cortar esquinas", "Ahorrar"], "correct": "Tomar atajos (mal)", "transcript": "Cutting corners."},
        {"audio_text": "Easy does it.", "options": ["Con calma", "Fácil lo hace", "Hazlo"], "correct": "Con calma", "transcript": "Easy does it."},
        {"audio_text": "Get your act together.", "options": ["Ponte las pilas", "Actúa bien", "Junta tu acto"], "correct": "Ponte las pilas", "transcript": "Get your act together."},
        {"audio_text": "Hang in there.", "options": ["No te rindas", "Cuelga ahí", "Espera"], "correct": "No te rindas", "transcript": "Hang in there."},
    ]
    
    speaking_content = [
        # --- BASIC (0-29) ---
        {"phrase": "Hello World", "translation": "Hola Mundo"},
        {"phrase": "I love learning", "translation": "Amo aprender"},
        {"phrase": "Good Morning", "translation": "Buenos Días"},
        {"phrase": "My name is...", "translation": "Mi nombre es..."},
        {"phrase": "Where is the bathroom?", "translation": "¿Dónde está el baño?"},
        {"phrase": "One coffee please", "translation": "Un café por favor"},
        {"phrase": "How much is it?", "translation": "¿Cuánto cuesta?"},
        {"phrase": "Nice to meet you", "translation": "Gusto en conocerte"},
        {"phrase": "See you tomorrow", "translation": "Nos vemos mañana"},
        {"phrase": "I am happy", "translation": "Estoy feliz"},
        {"phrase": "Good Night", "translation": "Buenas Noches"},
        {"phrase": "Thank you", "translation": "Gracias"},
        {"phrase": "You are welcome", "translation": "De nada"},
        {"phrase": "Excuse me", "translation": "Disculpa"},
        {"phrase": "I am sorry", "translation": "Lo siento"},
        {"phrase": "Can I help?", "translation": "¿Puedo ayudar?"},
        {"phrase": "What is this?", "translation": "¿Qué es esto?"},
        {"phrase": "I don't understand", "translation": "No entiendo"},
        {"phrase": "Speak slowly", "translation": "Habla despacio"},
        {"phrase": "Repeat please", "translation": "Repite por favor"},
        {"phrase": "I am ready", "translation": "Estoy listo"},
        {"phrase": "Let's go", "translation": "Vamos"},
        {"phrase": "Wait for me", "translation": "Espérame"},
        {"phrase": "Have a nice day", "translation": "Ten un buen día"},
        {"phrase": "I like this", "translation": "Me gusta esto"},
        {"phrase": "I don't like it", "translation": "No me gusta"},
        {"phrase": "Where are you?", "translation": "¿Dónde estás?"},
        {"phrase": "I am home", "translation": "Estoy en casa"},
        {"phrase": "Time to sleep", "translation": "Hora de dormir"},
        {"phrase": "Good job", "translation": "Buen trabajo"},
        
        # --- INTERMEDIATE (30-59) ---
        {"phrase": "I would like a table.", "translation": "Quisiera una mesa"},
        {"phrase": "The check, please.", "translation": "La cuenta, por favor"},
        {"phrase": "Can I pay by card?", "translation": "¿Puedo pagar con tarjeta?"},
        {"phrase": "Where is the nearest bank?", "translation": "¿Dónde está el banco más cercano?"},
        {"phrase": "I have an appointment.", "translation": "Tengo una cita"},
        {"phrase": "Can you recommend a hotel?", "translation": "¿Puedes recomendar un hotel?"},
        {"phrase": "I'm lost.", "translation": "Estoy perdido"},
        {"phrase": "How do I get to...?", "translation": "¿Cómo llego a...?"},
        {"phrase": "Is it far?", "translation": "¿Está lejos?"},
        {"phrase": "I feel sick.", "translation": "Me siento enfermo"},
        {"phrase": "I need a doctor.", "translation": "Necesito un médico"},
        {"phrase": "Call the police!", "translation": "¡Llama a la policía!"},
        {"phrase": "Help me!", "translation": "¡Ayúdame!"},
        {"phrase": "Do not disturb.", "translation": "No molestar"},
        {"phrase": "I'm just looking.", "translation": "Solo estoy mirando"},
        {"phrase": "Do you have this in red?", "translation": "¿Tienes esto en rojo?"},
        {"phrase": "I'll take it.", "translation": "Me lo llevo"},
        {"phrase": "It's too expensive.", "translation": "Es demasiado caro"},
        {"phrase": "Can you give me a discount?", "translation": "¿Me puedes dar un descuento?"},
        {"phrase": "What do you think?", "translation": "¿Qué opinas?"},
        {"phrase": "I agree completely.", "translation": "Estoy totalmente de acuerdo"},
        {"phrase": "I see your point.", "translation": "Entiendo tu punto"},
        {"phrase": "That's interesting.", "translation": "Eso es interesante"},
        {"phrase": "Really?", "translation": "¿De verdad?"},
        {"phrase": "I'm kidding.", "translation": "Estoy bromeando"},
        {"phrase": "Don't worry about it.", "translation": "No te preocupes por eso"},
        {"phrase": "It's not a big deal.", "translation": "No es gran cosa"},
        {"phrase": "Congratulations!", "translation": "¡Felicidades!"},
        {"phrase": "Good luck!", "translation": "¡Buena suerte!"},
        {"phrase": "Cheers!", "translation": "¡Salud!"},
        
        # --- ADVANCED (60-89) ---
        {"phrase": "Let's agree to disagree.", "translation": "Quedemos en que no estamos de acuerdo"},
        {"phrase": "It's a matter of opinion.", "translation": "Es cuestión de opinión"},
        {"phrase": "To play devil's advocate...", "translation": "Haciendo de abogado del diablo..."},
        {"phrase": "In the grand scheme of things...", "translation": "En el gran esquema de las cosas..."},
        {"phrase": "Assuming that is true...", "translation": "Asumiendo que eso es verdad..."},
        {"phrase": "Looking at the big picture...", "translation": "Viendo el panorama completo..."},
        {"phrase": "It goes without saying...", "translation": "No hace falta decir..."},
        {"phrase": "As far as I'm concerned...", "translation": "Por lo que a mí respecta..."},
        {"phrase": "To make matters worse...", "translation": "Para empeorar las cosas..."},
        {"phrase": "On the other hand...", "translation": "Por otro lado..."},
        {"phrase": "Conversely...", "translation": "Por el contrario..."},
        {"phrase": "Moreover...", "translation": "Además..."},
        {"phrase": "Furthermore...", "translation": "Es más..."},
        {"phrase": "Nevertheless...", "translation": "Sin embargo..."},
        {"phrase": "Consequently...", "translation": "En consecuencia..."},
        {"phrase": "I am inclined to believe...", "translation": "Me inclino a creer..."},
        {"phrase": "Without a shadow of a doubt...", "translation": "Sin lugar a dudas..."},
        {"phrase": "It's highly unlikely.", "translation": "Es altamente improbable"},
        {"phrase": "I wouldn't bet on it.", "translation": "No apostaría a ello"},
        {"phrase": "Let's touch base later.", "translation": "Hablemos más tarde"},
        {"phrase": "Keep me in the loop.", "translation": "Manténme informado"},
        {"phrase": "Think outside the box.", "translation": "Piensa fuera de la caja"},
        {"phrase": "Going forward...", "translation": "De aquí en adelante..."},
        {"phrase": "At the end of the day...", "translation": "Al fin y al cabo..."},
        {"phrase": "With all due respect...", "translation": "Con todo respeto..."},
        {"phrase": "If I recall correctly...", "translation": "Si mal no recuerdo..."},
        {"phrase": "To cut a long story short...", "translation": "Resumiendo..."},
        {"phrase": "I'm on the fence.", "translation": "Estoy indeciso"},
        {"phrase": "Let's play it by ear.", "translation": "Vamos viendo"},
        {"phrase": "It's water under the bridge.", "translation": "Es agua pasada"},
    ]

    for c_idx, c_data in enumerate(courses_data):
        # Update or Create Course
        course = db.query(models.Course).filter(models.Course.title == c_data["title"]).first()
        if not course:
            course = models.Course(
                title=c_data["title"], 
                level=c_data["level"], 
                description=c_data["desc"], 
                order_index=c_idx
            )
            db.add(course)
            db.flush()
        else:
             # Ensure index matches just in case
             course.order_index = c_idx
             course.level = c_data["level"]
             course.description = c_data["desc"]

        for t_idx, t_data in enumerate(track_types):
            # Update or Create Track
            track = db.query(models.Track).filter(models.Track.course_id == course.id, models.Track.key == t_data["key"]).first()
            if not track:
                track = models.Track(
                    course_id=course.id,
                    key=t_data["key"],
                    title=t_data["title"],
                    color=t_data["color"],
                    order_index=t_idx
                )
                db.add(track)
                db.flush()

            # Create/Update 10 missions per track
            for m_idx in range(10):
                mission_title = f"{t_data['key'].capitalize()} Mission {m_idx + 1}"
                mission = db.query(models.Mission).filter(models.Mission.track_id == track.id, models.Mission.order_index == m_idx).first()
                
                if not mission:
                    mission = models.Mission(
                        course_id=course.id,
                        track_id=track.id,
                        title=mission_title,
                        description=f"Objective: Master {t_data['key']} concepts level {m_idx + 1}",
                        duration_min=5 + m_idx,
                        xp=10 + (m_idx * 5),
                        order_index=m_idx
                    )
                    db.add(mission)
                    db.flush()
                
                # SEED/UPDATE CONTENT SECTIONS
                sections_count = 3 # 3 exercises per mission
                for s_idx in range(sections_count):
                    s_payload = {}
                    s_key = t_data["key"] 
                    
                    # Content Selection Logic:
                    # Offset by Course Index (30 items per course)
                    offset = c_idx * 30 
                    # Select item
                    if t_data["key"] == "vocabulary":
                        idx = (offset + (m_idx * sections_count + s_idx)) % len(vocab_content)
                        item = vocab_content[idx]
                        s_payload = item
                    elif t_data["key"] == "grammar":
                        item = grammar_content[(offset + (m_idx * sections_count + s_idx)) % len(grammar_content)]
                        s_payload = item
                    elif t_data["key"] == "listening":
                        item = listening_content[(offset + (m_idx * sections_count + s_idx)) % len(listening_content)]
                        s_payload = item
                    elif t_data["key"] == "speaking":
                        item = speaking_content[(offset + (m_idx * sections_count + s_idx)) % len(speaking_content)]
                        s_payload = item
                        
                    section = db.query(models.MissionSection).filter(models.MissionSection.mission_id == mission.id, models.MissionSection.order_index == s_idx).first()
                    
                    if section:
                        # CRITICAL UPDATE: Update content for existing missions
                        section.payload_json = s_payload
                        section.key = s_key
                        section.title = f"Exercise {s_idx + 1}"
                    else:
                        section = models.MissionSection(
                            mission_id=mission.id,
                            key=s_key,
                            title=f"Exercise {s_idx + 1}",
                            order_index=s_idx,
                            payload_json=s_payload
                        )
                        db.add(section)
    
    db.commit()
    print("Seeding Complete (Updated Content).")

@app.on_event("startup")
def startup_event():
    db = next(get_db())
    seed_courses(db)

# --- AUTH ENDPOINTS ---

@app.get("/ping")
def ping():
    return { "pong": True }

@app.post("/auth/register")
def register(user: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(models.User).filter(models.User.email == user.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    fake_hashed = user.password + "notreallyhashed"
    db_user = models.User(
        email=user.email, 
        hashed_password=fake_hashed, 
        name=user.name, 
        age=user.age,
        english_level=user.english_level,
        motivation=user.motivation,
        daily_goal_min=user.daily_goal_min
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # Initialize Stats
    stats = models.UserStats(user_id=db_user.id, credits=0, xp_total=0, streak=0, last_activity_date=None)
    db.add(stats)
    
    # Unlock first mission of each track in first course
    first_course = db.query(models.Course).order_by(models.Course.order_index).first()
    if first_course:
        for track in first_course.tracks:
            first_mission = db.query(models.Mission).filter(models.Mission.track_id == track.id, models.Mission.order_index == 0).first()
            if first_mission:
                progress = models.UserMissionProgress(user_id=db_user.id, mission_id=first_mission.id, status="unlocked")
                db.add(progress)
    
    db.commit()
    return {"success": True, "status": "success", "user_id": db_user.id}

@app.post("/auth/login")
def login(creds: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == creds.email).first()
    if not user:
         raise HTTPException(status_code=400, detail="User not found")
    if user.hashed_password != creds.password + "notreallyhashed":
         raise HTTPException(status_code=400, detail="Incorrect password")
    
    if not user.stats:
        stats = models.UserStats(user_id=user.id, credits=0, xp_total=0, streak=0, last_activity_date=None)
        db.add(stats)
        db.commit()
        db.refresh(user)

    # --- STREAK LOGIC ---
    today = date.today()
    last_active = user.stats.last_activity_date
    streak_msg = None
    
    if last_active:
        delta = (today - last_active).days
        if delta == 1:
            # Consecutive day, increment handled in mission/daily logic? 
            # Or just keep it. Usually streak increments on action, not just login.
            # But we verify it's not broken.
            pass
        elif delta > 1:
            # Missed a day!
            # Check for Streak Freeze
            inventory = json.loads(user.inventory) if user.inventory else []
            if "streak_freeze" in inventory:
                inventory.remove("streak_freeze")
                user.inventory = json.dumps(inventory)
                streak_msg = "Tu Protector de Racha salvo tu progreso!"
                # Update last active to yesterday so it looks like they didn't miss?
                # Or just keep streak as is and set today.
                user.stats.last_activity_date = today # Mark active today to bridge gap
            else:
                user.stats.streak = 0
                streak_msg = "Oh no! Has perdido tu racha."
    
    # Update last active if strictly login counts as activity, or wait for mission?
    # Usually apps count login as "active day".
    user.stats.last_activity_date = today
    db.commit()

    # Get Certificates
    certs = [{"id": str(c.id), "title": c.title, "level": c.level, "date": c.date_awarded} for c in user.certificates]
    
    # helper for inv
    user_inv = json.loads(user.inventory) if user.inventory else []

    return {
        "success": True, 
        "access_token": "fake-jwt-token-for-" + str(user.id), 
        "token_type": "bearer", 
        "user": {
            "id": user.id,
            "email": user.email, 
            "name": user.name,
            "age": user.age,
            "avatar": user.avatar,
            "theme": user.theme,
            "xp": user.stats.xp_total,
            "credits": user.stats.credits,
            "streak": user.stats.streak,
            "inventory": user_inv,
            "activeBadge": user.active_badge,
            "certificates": certs,
            "streak_message": streak_msg
        }
    }

# --- AUTH DEPENDENCY ---
from fastapi.security import OAuth2PasswordBearer
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    # Simple "fake-jwt-token-for-{user_id}" parsing
    try:
        user_id = int(token.replace("fake-jwt-token-for-", ""))
        user = db.query(models.User).get(user_id)
        if not user:
            raise HTTPException(status_code=401, detail="Invalid user")
        return user
    except:
        raise HTTPException(status_code=401, detail="Invalid token format")

@app.post("/profile/update")
def update_profile(
    update: ProfileUpdate,
    user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # ----------------------------
    # 1) Basic Profile
    # ----------------------------
    if update.name is not None:
        user.name = update.name
    if update.age is not None:
        user.age = update.age
    if update.avatar is not None:
        user.avatar = update.avatar
    if update.theme is not None:
        user.theme = update.theme
    if update.activeBadge is not None:
        user.active_badge = update.activeBadge
    
    # ----------------------------
    # 2) Email Change (Optional)
    # ----------------------------
    if update.new_email and update.new_email != user.email:
        existing = db.query(models.User).filter(models.User.email == update.new_email).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email already taken")
        user.email = update.new_email

    # ----------------------------
    # 3) Password (note: this is NOT real hashing; improve later)
    # ----------------------------
    if update.password:
        user.hashed_password = update.password + "notreallyhashed"

    # ----------------------------
    # 4) Stats (XP/Credits/Streak)
    # Ensure user.stats exists
    # ----------------------------
    if not getattr(user, "stats", None):
        # if your model creates Stats automatically, this is not executed.
        # if not, create one:
        stats = models.UserStats(
            user_id=user.id,
            xp_total=0,
            credits=0,
            streak=0
        )
        db.add(stats)
        db.flush()
        user.stats = stats

    # Persistence
    if update.xp is not None:
        user.stats.xp_total = int(update.xp)
    if update.credits is not None:
        user.stats.credits = int(update.credits)
    if update.streak is not None:
        user.stats.streak = int(update.streak)

    # ----------------------------
    # 5) Inventory (DB handles it as JSON string)
    # ----------------------------
    if update.inventory is not None:
        try:
            user.inventory = json.dumps(list(update.inventory))
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid inventory format")

    db.commit()
    db.refresh(user)

    return {
        "success": True,
        "message": "Profile updated",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "age": user.age,
            "avatar": user.avatar,
            "theme": user.theme,
            "xp": user.stats.xp_total if user.stats else 0,
            "credits": user.stats.credits if user.stats else 0,
            "streak": user.stats.streak if user.stats else 0,
            "inventory": user.inventory,
        }
    }

# --- LMS ENDPOINTS ---

@app.get("/courses")
def get_courses(user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    all_courses = db.query(models.Course).filter(models.Course.is_active == True).order_by(models.Course.order_index).all()
    
    courses_data = []
    # Logic to calculate unlock status sequentially
    for i, c in enumerate(all_courses):
        # 1. Calculate Progress
        total_missions = db.query(models.Mission).filter(models.Mission.course_id == c.id).count()
        completed_count = db.query(models.UserMissionProgress).join(models.Mission).filter(
            models.UserMissionProgress.user_id == user.id,
            models.UserMissionProgress.status == "completed",
            models.Mission.course_id == c.id
        ).count()
        
        is_completed = total_missions > 0 and completed_count >= total_missions
        progress_percent = int((completed_count / total_missions * 100)) if total_missions > 0 else 0
        
        # 2. Unlock Logic
        is_unlocked = False
        if i == 0:
            is_unlocked = True # First one always open
        else:
            # Check if previous course in the list (ordered by index) was completed
            # We can check the computed 'is_completed' of the previous entry in courses_data
            if courses_data[i-1]["is_completed"]:
                is_unlocked = True

        # Override for testing/super-user if needed, or specific DB overrides
        # (Optional: check if user has explicit unlock entry in a future 'UserCourseProgress' table)
        
        courses_data.append({
            "id": c.id,
            "title": c.title,
            "description": c.description,
            "level": c.level,
            "order_index": c.order_index,
            "is_active": c.is_active,
            "is_unlocked": is_unlocked,
            "is_completed": is_completed,
            "progress_percent": progress_percent,
            "total_missions": total_missions,
            "completed_count": completed_count
        })

    return {"success": True, "courses": courses_data}


@app.get("/courses/{course_id}/solar")
def get_solar_system(course_id: int, user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    course = db.query(models.Course).filter(models.Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    # --- SELF-HEALING PROGRESSION CHECK ---
    # Ensure next course unlocks if previous is done, handling cases where unlock trigger was missed
    if course.order_index > 0:
        prev_course = db.query(models.Course).filter(models.Course.order_index == course.order_index - 1).first()
        if prev_course:
            # Check if prev course is completed
            total_prev = db.query(models.Mission).filter(models.Mission.course_id == prev_course.id).count()
            completed_prev = db.query(models.UserMissionProgress).join(models.Mission).filter(
                models.UserMissionProgress.user_id == user.id,
                models.UserMissionProgress.status == "completed",
                models.Mission.course_id == prev_course.id
            ).count()
            
            if completed_prev >= total_prev and total_prev > 0:
                # Previous Completed -> Check if current is unlocked
                # We check if there is ANY progress entry for the current course
                has_progress = db.query(models.UserMissionProgress).join(models.Mission).filter(
                    models.UserMissionProgress.user_id == user.id,
                    models.Mission.course_id == course.id
                ).first()
                
                if not has_progress:
                    # Auto-Unlock Logic: Unlock first mission of all tracks
                    print(f"Auto-unlocking Course {course.id} for User {user.id}")
                    for track in course.tracks:
                         m1 = db.query(models.Mission).filter(models.Mission.track_id == track.id, models.Mission.order_index == 0).first()
                         if m1:
                             # Double check overlap
                             existing = db.query(models.UserMissionProgress).filter(
                                models.UserMissionProgress.user_id == user.id,
                                models.UserMissionProgress.mission_id == m1.id
                             ).first()
                             if not existing:
                                 new_prog = models.UserMissionProgress(user_id=user.id, mission_id=m1.id, status="unlocked")
                                 db.add(new_prog)
                    db.commit()
                    
    tracks_data = []
    for track in course.tracks:
        missions_data = []
        for mission in track.missions:
            # Check user progress
            prog = db.query(models.UserMissionProgress).filter(
                models.UserMissionProgress.user_id == user.id,
                models.UserMissionProgress.mission_id == mission.id
            ).first()
            status_val = prog.status if prog else "locked"
            
            missions_data.append({
                "id": mission.id,
                "title": mission.title,
                "xp": mission.xp,
                "order": mission.order_index,
                "status": status_val
            })
            
        tracks_data.append({
            "id": track.id,
            "title": track.title,
            "key": track.key,
            "color": track.color,
            "missions": missions_data
        })
        
    return {
        "success": True,
        "course": {"title": course.title, "level": course.level},
        "solar_system": tracks_data
    }

@app.get("/missions/{mission_id}")
def get_mission(mission_id: int, db: Session = Depends(get_db)):
    mission = db.query(models.Mission).get(mission_id)
    if not mission:
        raise HTTPException(status_code=404, detail="Mission not found")
    
    sections = []
    for sec in mission.sections:
        sections.append({
            "key": sec.key,
            "title": sec.title,
            "payload": sec.payload_json
        })
    
    return {
        "success": True,
        "mission": {
            "id": mission.id,
            "title": mission.title,
            "description": mission.description,
            "track": mission.track.key,
            "sections": sections
        }
    }

@app.post("/missions/{mission_id}/submit")
def submit_mission(mission_id: int, submission: MissionSubmit, user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    next_mission = None
    passed = submission.score >= 70
    
    mission = db.query(models.Mission).get(mission_id)
    if not mission: raise HTTPException(404, "Mission not found")
    
    user_stats = db.query(models.UserStats).filter(models.UserStats.user_id == user.id).first()
    
    progress = db.query(models.UserMissionProgress).filter(
        models.UserMissionProgress.user_id == user.id,
        models.UserMissionProgress.mission_id == mission_id
    ).first()
    
    if not progress:
        progress = models.UserMissionProgress(user_id=user.id, mission_id=mission_id, attempts=0)
        db.add(progress)
    
    progress.attempts += 1
    progress.score = submission.score
    
    xp_gained = 0
    message = "Mission Complete"
    credits_gained = 0
    
    if passed and progress.status != "completed":
        progress.status = "completed"
        progress.completed_at = datetime.utcnow()
        # XP Reward Increased to 25 as requested
        mission_xp = 25 
        progress.xp_earned = mission_xp
        xp_gained = mission_xp
        
        # Credits/Coins Reward - Requested 25 coins per mission
        mission_credits = 25
        credits_gained = mission_credits
        
        # Stats update
        user_stats.xp_total += xp_gained
        user_stats.credits += credits_gained
        
        # Streak Logic
        today = date.today()
        if user_stats.last_activity_date != today:
             # Simple increment for MVP
             user_stats.streak += 1
             user_stats.last_activity_date = today
             
        # Unlock next mission in Track
        next_mission = db.query(models.Mission).filter(
            models.Mission.track_id == mission.track_id, 
            models.Mission.order_index == mission.order_index + 1
        ).first()
        
        if next_mission:
            # Check if already has progress
            next_prog = db.query(models.UserMissionProgress).filter(
                models.UserMissionProgress.user_id == user.id,
                models.UserMissionProgress.mission_id == next_mission.id
            ).first()
            if not next_prog:
                new_prog = models.UserMissionProgress(user_id=user.id, mission_id=next_mission.id, status="unlocked")
                db.add(new_prog)
        
        # Connect Vocabulary to User (SRS System)
        for section in mission.sections:
            if section.key == 'vocabulary' and section.payload_json:
                payload = section.payload_json
                if "word" in payload:
                    # Check if word exists for user
                    existing_vocab = db.query(models.VocabularyItem).filter(
                        models.VocabularyItem.user_id == user.id,
                        models.VocabularyItem.word == payload["word"]
                    ).first()
                    
                    if not existing_vocab:
                        # Add new vocab
                        new_vocab = models.VocabularyItem(
                            user_id=user.id,
                            word=payload["word"],
                            translation=payload.get("translation", ""),
                            example=payload.get("example", f"Learned in {mission.title}"),
                            next_review=time.time(), 
                            interval=0,
                            ease_factor=2.5,
                            streak=0
                        )
                        db.add(new_vocab)

        # --- COURSE COMPLETION & PROGRESSION LOGIC ---
        # Check if ALL missions in the CURRENT COURSE are completed
        current_course_id = mission.course_id
        
        # Get total missions in this course
        total_missions = db.query(models.Mission).filter(models.Mission.course_id == current_course_id).count()
        
        # Get completed missions for user in this course
        completed_count = db.query(models.UserMissionProgress).join(models.Mission).filter(
            models.UserMissionProgress.user_id == user.id,
            models.UserMissionProgress.status == "completed",
            models.Mission.course_id == current_course_id
        ).count()
        
        if completed_count == total_missions:
            # Course Completed!
            message = "Course Completed! Level Up!"
            
            # Reward: +1 Life (Credits) & Streak Protector (Simulated)
            # Giving extra bonus credits for course completion
            user_stats.credits += 100 
            
            # Unlock NEXT COURSE
            current_course = db.query(models.Course).get(current_course_id)
            next_course = db.query(models.Course).filter(
                models.Course.order_index == current_course.order_index + 1
            ).first()
            
            if next_course:
                 # Unlock first mission of all tracks in next course
                 for track in next_course.tracks:
                     m1 = db.query(models.Mission).filter(models.Mission.track_id == track.id, models.Mission.order_index == 0).first()
                     if m1:
                         m1_prog = db.query(models.UserMissionProgress).filter(
                            models.UserMissionProgress.user_id == user.id, 
                            models.UserMissionProgress.mission_id == m1.id
                         ).first()
                         if not m1_prog:
                             db.add(models.UserMissionProgress(user_id=user.id, mission_id=m1.id, status="unlocked"))

    # --- COURSE COMPLETION CHECK ---
    # Check if all missions in this course are completed
    course_id = mission.course_id
    total_missions = db.query(models.Mission).filter(models.Mission.course_id == course_id).count()
    
    completed_missions = db.query(models.UserMissionProgress).join(models.Mission).filter(
        models.UserMissionProgress.user_id == user.id,
        models.UserMissionProgress.status == "completed",
        models.Mission.course_id == course_id
    ).count()

    course_msg = ""
    if completed_missions >= total_missions:
        course = db.query(models.Course).get(course_id)
        if course:
            # Check if cert already exists
            existing_cert = db.query(models.Certificate).filter(
                models.Certificate.user_id == user.id,
                models.Certificate.title == course.title
            ).first()
            
            if not existing_cert:
                new_cert = models.Certificate(
                    user_id=user.id,
                    title=course.title,
                    level=course.level,
                    date_awarded=date.today().strftime("%Y-%m-%d")
                )
                db.add(new_cert)
            
            # Always return message so User sees Victory Modal on replay of last mission
            course_msg = f"Felicidades! Has completado el curso {course.title}."

    db.commit()
    
    # --- VOCABULARY PROCESSING ---
    # Attempt to extract vocabulary from mission sections
    try:
        mission_model = db.query(models.Mission).get(mission_id)
        if mission_model and mission_model.sections:
            for section in mission_model.sections:
                if section.key == "vocabulary" and section.payload_json:
                    word = section.payload_json.get("word")
                    translation = section.payload_json.get("translation")
                    example = section.payload_json.get("example") or f"The word is {word}"
                    
                    if word and translation:
                        # Check if exists
                        existing_vocab = db.query(models.VocabularyItem).filter(
                            models.VocabularyItem.user_id == user.id,
                            models.VocabularyItem.word == word
                        ).first()
                        
                        if not existing_vocab:
                            new_vocab = models.VocabularyItem(
                                user_id=user.id,
                                word=word,
                                translation=translation,
                                example=example,
                                next_review=time.time() * 1000, # Now (in ms)
                                interval=1,
                                ease_factor=2.5,
                                streak=0
                            )
                            db.add(new_vocab)
            db.commit()
    except Exception as e:
        print(f"Vocab error: {e}")

    next_mission_id = next_mission.id if next_mission else None

    return {
        "success": True,
        "xp_gained": xp_gained,
        "credits_gained": credits_gained,
        "new_total_xp": user_stats.xp_total,
        "new_total_credits": user_stats.credits,
        "streak": user_stats.streak,
        "status": progress.status,
        "message": message,
        "course_completed": course_msg,
        "next_mission_id": next_mission_id
    }

@app.get("/stats")
def get_stats(user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    stats = db.query(models.UserStats).filter(models.UserStats.user_id == user.id).first()
    if not stats:
        return {"success": False, "error": "No stats found"}
        
    # Calculate Real Stats
    completed_missions = db.query(models.UserMissionProgress).filter(
        models.UserMissionProgress.user_id == user.id,
        models.UserMissionProgress.status == "completed"
    ).all()
    
    missions_count = len(completed_missions)
    
    # Estimate Words: 3 words/concepts per mission (roughly)
    words_count = missions_count * 3 
    
    # Calculate Minutes: Sum duration of completed missions
    minutes_count = 0
    for prog in completed_missions:
        m = db.query(models.Mission).get(prog.mission_id)
        if m:
            minutes_count += m.duration_min

    # Rank Logic
    rank = "Cadet (A1)"
    if stats.xp_total >= 1000: rank = "Explorer (A2)"
    if stats.xp_total >= 2500: rank = "Captain (B1)"
    if stats.xp_total >= 5000: rank = "Admiral (B2)"
    
    # Achievements Calculation
    perfect_scores = db.query(models.UserMissionProgress).filter(
        models.UserMissionProgress.user_id == user.id,
        models.UserMissionProgress.score >= 100
    ).count()

    achievements_data = {
        "lessonsCompleted": missions_count,
        "wordsLearned": len(user.vocabulary),
        "quizPerfect": perfect_scores
    }
    
    certs = [{"id": str(c.id), "title": c.title, "level": c.level, "date": c.date_awarded} for c in user.certificates]
    
    # Vocabulary Bank
    vocab_items = []
    for v in user.vocabulary:
        vocab_items.append({
            "id": v.id,
            "word": v.word,
            "translation": v.translation,
            "example": v.example,
            "nextReview": v.next_review,
            "interval": v.interval,
            "easeFactor": v.ease_factor,
            "streak": v.streak
        })

    return {
        "success": True,
        "stats": {
            "xp": stats.xp_total,
            "credits": stats.credits,
            "streak": stats.streak,
            "rank": rank,
            "missions_completed": missions_count,
            "words_learned": len(vocab_items) if vocab_items else words_count, # Use real count if available
            "minutes_spent": minutes_count
        },
        "achievements": achievements_data,
        "certificates": certs,
        "vocabularyBank": vocab_items
    }
