# Entity-Relationship Diagram for Health Risk Assessment System

```mermaid
erDiagram
    auth_users {
        uuid id PK
        string email
        timestamp created_at
        timestamp updated_at
    }

    health_assessments {
        uuid id PK
        uuid user_id FK
        integer age
        string gender
        numeric height
        numeric weight
        numeric bmi
        boolean family_diabetes
        boolean family_hypertension
        boolean family_obesity
        string smoking_status
        string alcohol_consumption
        string exercise_frequency
        string diet_type
        integer sleep_hours
        numeric diabetes_risk
        numeric obesity_risk
        numeric hypertension_risk
        text_array past_illnesses
        text_array current_symptoms
        string location
        text_array allergies
        timestamp created_at
        timestamp updated_at
    }

    daily_health_logs {
        uuid id PK
        uuid user_id FK
        date log_date
        numeric blood_pressure_systolic
        numeric blood_pressure_diastolic
        numeric blood_glucose
        numeric weight
        numeric exercise_minutes
        string meals_description
        string notes
        integer heart_rate
        numeric cholesterol_total
        numeric cholesterol_hdl
        numeric cholesterol_ldl
        numeric sleep_hours
        numeric water_intake
        numeric body_fat_percentage
        integer mood_rating
        integer daily_steps
        timestamp created_at
        timestamp updated_at
    }

    health_goals {
        uuid id PK
        uuid user_id FK
        string goal_type
        numeric target_value
        numeric current_value
        string status
        date deadline
        json day_completions
        timestamp created_at
        timestamp updated_at
    }

    chat_history {
        uuid id PK
        uuid user_id FK
        string session_id
        string role
        string content
        timestamp created_at
    }

    newsletter_subscriptions {
        uuid id PK
        uuid user_id FK
        string email
        timestamp subscribed_at
    }

    otp_codes {
        uuid id PK
        string email
        string otp_code
        string purpose
        boolean used
        timestamp created_at
        timestamp expires_at
    }

    otps {
        integer id PK
        string email
        string otp
        timestamp expires_at
    }

    auth_users ||--o{ health_assessments : "has"
    auth_users ||--o{ daily_health_logs : "logs"
    auth_users ||--o{ health_goals : "sets"
    auth_users ||--o{ chat_history : "chats"
