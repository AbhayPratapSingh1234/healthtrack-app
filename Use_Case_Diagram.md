# Use Case Diagram for HealthTrack - Health Risk Assessment System

## Overview
HealthTrack is a comprehensive health risk assessment platform that enables users to monitor their health, receive AI-powered recommendations, and track their wellness journey. The system integrates with external AI services and email providers for enhanced functionality.

## Actors
- **User (Primary Actor)**: Individuals seeking health assessment and monitoring
- **AI Systems (Secondary Actor)**: External AI models (OpenRouter, Tongyi) for analysis and recommendations
- **Email Service (Secondary Actor)**: Brevo email service for OTP and notifications

## Use Case Diagram

```plantuml
@startuml HealthTrack Use Case Diagram
!theme plain

actor "👤 User" as User
actor "🤖 AI Systems" as AI
actor "📧 Email Service" as Email

rectangle "HealthTrack System" {
    usecase "Register Account" as UC1
    usecase "Login" as UC2
    usecase "Reset Password" as UC3

    usecase "Complete Health\nQuestionnaire" as UC4
    usecase "View Assessment\nReport" as UC5

    usecase "Log Daily\nHealth Data" as UC6
    usecase "View Progress\nDashboard" as UC7
    usecase "Set Health Goals" as UC8
    usecase "Track Goal\nProgress" as UC9

    usecase "Chat with\nHealth Bot" as UC10
    usecase "Get AI\nRecommendations" as UC11
    usecase "Analyze Radiology\nReports" as UC12
    usecase "Analyze General\nHealth Reports" as UC13

    usecase "View Profile" as UC14
    usecase "Update Profile" as UC15

    usecase "View Blog Posts" as UC16
    usecase "View About Page" as UC17
    usecase "View Terms of\nService" as UC18
    usecase "View Privacy\nPolicy" as UC19
    usecase "View Cookie\nPolicy" as UC20
}

User --> UC1
User --> UC2
User --> UC3
User --> UC4
User --> UC5
User --> UC6
User --> UC7
User --> UC8
User --> UC9
User --> UC10
User --> UC11
User --> UC12
User --> UC13
User --> UC14
User --> UC15
User --> UC16
User --> UC17
User --> UC18
User --> UC19
User --> UC20

UC3 --> Email
UC10 --> AI
UC11 --> AI
UC12 --> AI
UC13 --> AI

UC2 ..> UC3 : <<include>>
UC4 ..> UC5 : <<include>>
UC8 ..> UC9 : <<include>>

UC6 ..> UC7 : <<extend>>
UC12 ..> UC13 : <<extend>>

@enduml
```

## Use Case Categories

### 🔐 Authentication (UC1-UC3)
- **Register Account**: Create new user account
- **Login**: Authenticate existing user
- **Reset Password**: Password recovery with OTP

### 📊 Health Assessment (UC4-UC5)
- **Complete Health Questionnaire**: Comprehensive health data collection
- **View Assessment Report**: AI-generated health risk analysis

### 📈 Daily Tracking (UC6-UC9)
- **Log Daily Health Data**: Record daily health metrics
- **View Progress Dashboard**: Visualize health trends
- **Set Health Goals**: Define wellness objectives
- **Track Goal Progress**: Monitor goal achievement

### 🤖 AI Features (UC10-UC13)
- **Chat with Health Bot**: Interactive AI health assistant
- **Get AI Recommendations**: Personalized health advice
- **Analyze Radiology Reports**: AI-powered medical imaging analysis
- **Analyze General Health Reports**: Document analysis and insights

### 👤 Profile Management (UC14-UC15)
- **View Profile**: Access personal information
- **Update Profile**: Modify account details

### 📖 Content (UC16-UC20)
- **View Blog Posts**: Health education content
- **View About Page**: Platform information
- **View Terms of Service**: Legal terms
- **View Privacy Policy**: Data protection policies
- **View Cookie Policy**: Cookie usage information

## Key Relationships

### Include Relationships (Mandatory)
- Login includes Reset Password (password recovery option)
- Complete Questionnaire includes View Report (assessment completion)
- Set Goals includes Track Progress (goal monitoring)

### Extend Relationships (Optional)
- Log Data extends View Dashboard (enhanced visualization)
- Radiology Analysis extends General Report Analysis (specialized analysis)

## System Integration Points
- **AI Systems**: Powers chatbot, recommendations, and report analysis
- **Email Service**: Handles OTP delivery and notifications
- **Database**: Stores user data, health assessments, and chat history
