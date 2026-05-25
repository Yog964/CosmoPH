# Textile Defect Analysis System Workflow

## Complete Workflow

```mermaid
flowchart TD

    A[Home Page]
    --> B[Upload Dataset]

    B --> C[Dataset Validation]

    C --> D[Defect Detection]

    D --> E[Anomaly Classification]

    E --> F[Graphs & Analytics]

    F --> G[Final Results Dashboard]
```

---

# 1. Home Page

The starting interface of the system where users begin the textile defect analysis process.

## Workflow

```mermaid
flowchart LR
    A[Open System] --> B[Navigate to Upload Section]
```

## Screenshot

![Home Page](https://github.com/user-attachments/assets/563054fb-406b-465a-ab0d-aebbb16fd3fe)

---

# 2. Upload Dataset

Users upload textile fabric datasets/images for inspection.

## Workflow

```mermaid
flowchart LR
    A[Select Dataset] --> B[Upload File]
    B --> C[Validate Dataset]
```

## Screenshot

![Upload Dataset](https://github.com/user-attachments/assets/e2ca5b52-c6f2-4a04-acae-06f891b2d4ad)

---

# 3. Defect Detection

The system scans uploaded textile images to identify defects.

## Workflow

```mermaid
flowchart TD
    A[Input Fabric Image]
    --> B[Image Processing]
    --> C[Defect Detection]
    --> D[Detected Output]
```

## Screenshot

![Defect Detection](https://github.com/user-attachments/assets/eccf79bd-b15a-44cb-8e01-68579a590d52)

---

# 4. Anomaly Classification

Detected defects are classified into specific categories.

## Workflow

```mermaid
flowchart LR
    A[Detected Defect]
    --> B[Feature Extraction]
    --> C[Classification]
    --> D[Predicted Category]
```

## Screenshot

![Anomaly Classification](https://github.com/user-attachments/assets/e7b3fc24-24df-4939-90fd-49a780df88ff)

---

# 5. Graphs & Analytics

The system generates analytical visualizations from prediction data.

## Workflow

```mermaid
flowchart TD
    A[Prediction Data]
    --> B[Generate Metrics]
    --> C[Create Graphs]
    --> D[Display Analytics]
```

## Screenshot

![Graphs](https://github.com/user-attachments/assets/6fa211f2-a84e-4062-bc0e-5f7dd97e865a)

---

# 6. Final Results Dashboard

Displays the final prediction and defect analysis summary.

## Workflow

```mermaid
flowchart LR
    A[Processed Data]
    --> B[Generate Results]
    --> C[Display Final Output]
```

## Screenshot

![Results](https://github.com/user-attachments/assets/4d682974-5dd9-4c67-986e-b5cc5c4bafbf)

---

# Overall Architecture Flow

![Overall Workflow](https://github.com/user-attachments/assets/b65dd3f7-f3a3-4522-b3de-5a4e457c6064)

---
