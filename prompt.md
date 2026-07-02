# Prompting Techniques:

1. Zero Shot Prompting - Direct Instructions in one shot.

2. Few Shot Prompting - Direct Instruction but with some examples outputs. This Influences the output.

3. Chain Of Thought Prompting - Instruction: model have some breakdown of problems and then solve it before giving final output


# Prompting System:

1. Alpaca Prompt: 
2. ChatML(OpenAI) Prompt: 
3. INST Format(LLaMA-2):
4. FLAN-T5:

ChatML is made standard but model can use other internally.

## 1. Alpaca Prompt

```text
### Instruction:
What is AI?

### Response:
```

---

## 2. ChatML (OpenAI)

```javascript
const messages = [
  {
    role: "system",
    content: "You are a helpful assistant."
  },
  {
    role: "user",
    content: "What is AI?"
  }
];
```

---

## 3. INST Format (LLaMA-2)

```text
<s>[INST] What is AI? [/INST]
```

With a system prompt:

```text
<s>[INST] <<SYS>>
You are a helpful assistant.
<</SYS>>

What is AI?
[/INST]
```

---

## 4. FLAN-T5

```text
Question: What is AI?

Answer:
```

or

```text
Translate English to French:
Hello

Output:
Bonjour
```
