# Data Flow Diagrams for Health Risk Assessment System

## Level 0 - Context Diagram

```mermaid
graph TD
    A[Users/Patients] --> B[Health Risk Assessment System]
    C[OpenRouter AI Models] --> B
    D[Brevo Email/OTP Service] --> B
    B --> E[Health Data Database]
    B --> F[User Authentication Database]
    B --> G[Chat History Database]
```

## Level 1 - Main Processes

```mermaid
graph TD
    subgraph "External Entities"
        U[Users]
        AI[OpenRouter AI]
        EMAIL[Brevo Email]
    end

    subgraph "Main Processes"
        AUTH[Authentication & Profile Management]
        ASSESS[Health Assessment & Risk Calculation]
        DASH[Dashboard & Analytics]
        LOG[Daily Health Logging]
        GOALS[Goal Setting & Tracking]
        CHAT[AI Health Chatbot]
        REPORT[Radiology Report Analysis]
        REC[AI Recommendations]
    end

    subgraph "Data Stores"
        AUTH_DB[(User Auth DB)]
        HEALTH_DB[(Health Data DB)]
        CHAT_DB[(Chat History DB)]
    end

    U --> AUTH
    U --> ASSESS
    U --> LOG
    U --> GOALS
    U --> CHAT
    U --> REPORT

    AUTH --> AUTH_DB
    ASSESS --> HEALTH_DB
    LOG --> HEALTH_DB
    GOALS --> HEALTH_DB
    CHAT --> CHAT_DB
    REPORT --> CHAT_DB

    AUTH --> DASH
    ASSESS --> DASH
    LOG --> DASH
    GOALS --> DASH

    DASH --> REC
    REC --> AI
    CHAT --> AI
    REPORT --> AI

    AUTH --> EMAIL
    EMAIL --> U
```

## Level 2 - Health Assessment Process

```mermaid
graph TD
    A[User Input<br/>Demographics & Lifestyle] --> B[Data Validation]
    B --> C[Risk Calculation Engine]

    C --> D[BMI Calculation]
    C --> E[Diabetes Risk Assessment]
    C --> F[Hypertension Risk Assessment]
    C --> G[Obesity Risk Assessment]
    C --> H[Lifestyle Factor Analysis]

    D --> I[Assessment Results]
    E --> I
    F --> I
    G --> I
    H --> I

    I --> J[Health Database Storage]
    J --> K[Results Display & Visualization]
    K --> L[User Dashboard]

    L --> M[Risk Gauges]
    L --> N[Progress Charts]
    L --> O[Health Metrics Display]
```

## Level 2 - AI Chatbot Process

```mermaid
graph TD
    A[User Query<br/>Health Questions] --> B[Query Processing]

    B --> C[Natural Language Parsing]
    B --> D[Intent Detection]

    C --> E[Context Retrieval]
    D --> E

    E --> F[User Health Data]
    E --> G[Assessment Results]
    E --> H[Chat History]
    E --> I[Medical Context]

    F --> J[AI Model Processing]
    G --> J
    H --> J
    I --> J

    J --> K[OpenRouter API]
    K --> L[Qwen Models]
    K --> M[Mistral Models]
    K --> N[Nemotron Models]

    L --> O[Response Generation]
    M --> O
    N --> O

    O --> P[Personalized Health Advice]
    O --> Q[Actionable Tips]
    O --> R[Follow-up Recommendations]

    P --> S[Chat History Storage]
    Q --> S
    R --> S

    S --> T[User Interface<br/>Chat Display]
```

## Data Flow Summary

### Primary Data Flows:
1. **User Registration**: Users → Authentication → User Database
2. **Health Assessment**: User Input → Validation → Risk Calculation → Results → Dashboard
3. **Daily Monitoring**: User Logs → Health Database → Progress Tracking → Analytics
4. **Goal Management**: User Goals → Goal Database → Progress Updates → Notifications
5. **AI Interactions**: User Queries → Context → AI Processing → Personalized Responses
6. **Report Analysis**: Medical Files → AI Analysis → Radiology Interpretation → User Display
7. **Communications**: System → Email Service → User Notifications → OTP Verification

### Key Data Transformations:
- **Raw Health Data** → **Risk Scores** → **Personalized Recommendations**
- **User Queries** → **Context-Aware Responses** → **Actionable Health Advice**
- **Medical Reports** → **AI Analysis** → **Clinical Insights**
- **Health Logs** → **Progress Analytics** → **Goal Adjustments**
