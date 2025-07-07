# Physics Research Agent

An autonomous physics research agent built with Next.js and LangChain that can conduct physics research and push the boundaries of scientific knowledge.

**🚀 Deployment Status: Ready for Vercel deployment**

## Features

- **Interactive Chat Interface**: Communicate with the physics research agent
- **Real-time Progress Tracking**: Watch how the agent thinks and processes requests
- **Research Results Display**: View generated equations, calculations, and findings
- **Mathematical Notation**: Full LaTeX support for equations and formulas
- **WebSocket Integration**: Real-time communication and updates
- **Database Storage**: Persistent session and research data storage

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Node.js, Socket.IO, Prisma ORM
- **AI/ML**: LangChain, OpenAI GPT-4
- **Database**: PostgreSQL
- **Deployment**: Vercel with automatic GitHub deployments

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- OpenAI API key

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd physics-research-agent
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp env.example .env.local
```

Edit `.env.local` with your actual values:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/physics_research_agent"
OPENAI_API_KEY="your_openai_api_key_here"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your_nextauth_secret_here"
```

4. Set up the database:
```bash
npx prisma generate
npx prisma db push
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Deployment

### Automatic Deployment with Vercel

1. Push your code to GitHub
2. Connect your GitHub repository to Vercel
3. Set up environment variables in Vercel dashboard:
   - `DATABASE_URL`
   - `OPENAI_API_KEY`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL`
4. Deploy automatically on every push to main branch

### Manual Deployment

```bash
npm run build
npm start
```

## Project Structure

```
├── src/
│   ├── app/                 # Next.js app directory
│   │   ├── globals.css      # Global styles
│   │   ├── layout.tsx       # Root layout
│   │   └── page.tsx         # Main page
│   ├── components/          # React components
│   │   ├── ChatInterface.tsx
│   │   ├── ProgressSection.tsx
│   │   └── ResultsSection.tsx
│   ├── lib/                 # Utility libraries
│   │   ├── agent.ts         # LangChain physics agent
│   │   └── websocket.ts     # WebSocket configuration
│   └── types/               # TypeScript type definitions
│       └── research.ts      # Research session types
├── prisma/                  # Database schema
│   └── schema.prisma
├── public/                  # Static assets
└── package.json
```

## Usage

1. **Start a Conversation**: Type your physics question in the chat interface
2. **Monitor Progress**: Watch the agent's thinking process in the progress section
3. **View Results**: See generated equations, calculations, and research findings
4. **Download Results**: Export individual results or entire sessions

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

If you encounter any issues or have questions, please open an issue on GitHub. 