# Code Roaster

Build a full web application called "Roast My Code" — a fun, 

AI-powered code roasting tool. Here are the full details:

---

## 🎯 App Purpose

Users paste their code, and an AI gives it a brutal but funny 

comedy roast — pointing out bad practices, messy variable names, 

and poor logic in a hilarious way.

---

## 🎨 Design & UI

- Dark theme (deep black background #0a0a0a)

- Neon accent colors: hot pink (#ff2d78) and electric purple (#7b2fff)

- Font: "Space Grotesk" from Google Fonts for headings, 

  "JetBrains Mono" for code

- Fully responsive (mobile + desktop)

- Smooth animations using Framer Motion

### Layout:

1. **Hero Section**

   - Big bold title: "Roast My Code 🔥"

   - Subtitle: "Paste your code. Prepare to be destroyed."

   - A flame/fire animated emoji or Lottie animation

2. **Main Panel** (two columns on desktop, stacked on mobile)

   - LEFT: Code input area

     - Large textarea with syntax highlighting feel 

       (dark bg, monospace font)

     - Language selector dropdown 

       (JavaScript, Python, C++, Java, PHP, Other)

     - "Roast It 🔥" button — neon pink, bold, with fire emoji

   - RIGHT: Roast output area

     - Shows the AI roast response

     - Has a "Copy Roast" button

     - Has a "Share on Twitter" button 

       (pre-fills tweet with the roast)

     - Roast severity meter 

       (1–5 flames rating shown visually 🔥🔥🔥🔥🔥)

3. **Examples Section**

   - 3 cards showing funny example roasts

   - Each card has: code snippet + roast result

4. **Footer**

   - "Made with 💀 and AI"

   - No actual roasters were harmed

---

## ⚙️ Functionality

- Use the Anthropic Claude API to generate roasts

- API call sends the user's code + language to Claude with 

  this system prompt:

"""

You are a savage but hilarious comedy roast master who reviews 

code. When given code, you roast it brutally but funnily — 

like a stand-up comedian. 

Rules:

- Point out bad variable names, messy logic, inefficiencies

- Be funny, sarcastic, use emojis

- Keep it under 150 words

- End with one "backhanded compliment"

- Never be actually mean or offensive about the person, 

  only the code

- Rate the code from 1-5 flames at the end 

  (1 = disaster, 5 = surprisingly okay)

Format your response as JSON:

{

  "roast": "your funny roast here",

  "flames": 2,

  "backhandedCompliment": "I mean at least it runs... probably."

}

"""

- Parse the JSON response and display each part separately

- Show a loading animation while waiting (spinning fire emoji)

- Handle errors gracefully with a funny message: 

  "Even our AI refused to look at this code 💀"

---

## 🔧 Technical Requirements

- React + TypeScript

- Tailwind CSS for styling

- Framer Motion for animations

- The Anthropic API key should be stored in .env as 

  VITE_ANTHROPIC_API_KEY

- No backend needed — call API directly from frontend

- Add a character counter on the textarea (max 2000 characters)

- Disable the button if textarea is empty

---

## 📱 Mobile Responsiveness

- Stack columns vertically on mobile

- Make the textarea at least 200px tall on mobile

- Ensure buttons are touch-friendly (min 44px height)

---

## ✨ Extra Polish

- Add a confetti explosion when flames = 5

- Add a skull animation when flames = 1

- Smooth fade-in for the roast result

- Hover effects on all buttons

- Toast notification when roast is copied

---

Build the complete app with all files ready to run.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://code-roast-bot.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/111c0d18-6fab-459b-b34a-e6d3f96a0cff).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
