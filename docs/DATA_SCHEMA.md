# Data Schema Proposal

## fairy

```json
{
  "id": "fae",
  "name": "Fae",
  "title": "Career Smith",
  "archetype": "Opportunity Forger",
  "origin": "Born from a user need.",
  "sacredPurpose": "What this fairy protects or creates.",
  "strengths": [],
  "weaknesses": [],
  "shadowRisk": "Distortion of the gift.",
  "skills": [],
  "vision": [],
  "controls": [],
  "forbidden": [],
  "memoryScope": [],
  "growthPath": [],
  "level": 1,
  "xp": 0
}
```

## skill

```json
{
  "id": "career-smith",
  "fairyId": "fae",
  "name": "Career Smith",
  "mission": "What the skill does.",
  "inputs": [],
  "outputs": [],
  "commands": [],
  "permissionTier": "approved-actions"
}
```

## memory_leaf

```json
{
  "id": "uuid",
  "branch": "career",
  "title": "Remote aligned work constraint",
  "body": "User-approved memory content.",
  "createdAt": "iso timestamp",
  "source": "user|fairy|import|tool"
}
```

## event

```json
{
  "id": "uuid",
  "type": "aethersense|skill|genesis|memory|tool|permission|reflection",
  "title": "Short event title",
  "detail": "Human-readable event detail",
  "createdAt": "iso timestamp"
}
```

## reflection

```json
{
  "id": "uuid",
  "fairyId": "fae",
  "triggerEventId": "uuid",
  "outcome": "accepted|rejected|edited|ignored|saved",
  "lesson": "What changed for future behavior",
  "traitAdjustments": {
    "caution": 1,
    "urgency": -1
  },
  "createdAt": "iso timestamp"
}
```

