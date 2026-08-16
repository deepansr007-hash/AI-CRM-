# AI CRM REST API Specifications

All endpoints communicate via JSON format. Secured endpoints require header string structure format: `Authorization: Bearer <JWT_Token>`.

---

## 1. Authentication Endpoints

### Login
- **URL**: `/api/auth/login`
- **Method**: `POST`
- **Payload**:
  ```json
  { "username": "admin", "password": "admin123" }
  ```
- **Response (200 OK)**:
  ```json
  {
    "token": "eyJhbGciOi...",
    "user": { "username": "admin", "role": "admin", "email": "admin@aicrm.com" }
  }
  ```

---

## 2. Leads Endpoints

### List Leads
- **URL**: `/api/leads`
- **Method**: `GET`
- **Response (200 OK)**: Array of lead objects containing metric attributes.

### Create Lead (Triggers AI scoring)
- **URL**: `/api/leads`
- **Method**: `POST`
- **Payload**:
  ```json
  {
    "name": "Sarah Connor",
    "email": "sconnor@cyberdyne.org",
    "value": 150000.0,
    "source": "Referral",
    "status": "proposal"
  }
  ```

---

## 3. Retention Endpoints

### Add Interaction Log (Triggers Churn recalculation)
- **URL**: `/api/customers/:id/interactions`
- **Method**: `POST`
- **Payload**:
  ```json
  {
    "type": "call",
    "direction": "incoming",
    "description": "Client requested documentation regarding GDPR parameters."
  }
  ```
- **Response (201 Created)**: Returns updated churn risk metrics.
