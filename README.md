# BrainBoard AI

AI-alapu vizualis gondolatterkep es jegyzetelo alkalmazas.

## Tech Stack

- **Next.js 16** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS 4** - Styling
- **React Flow (@xyflow/react)** - Infinite canvas
- **Prisma 7** - Database ORM (PostgreSQL)
- **Lucide React** - Icons

## Getting Started

```bash
npm install
npx prisma generate
npm run dev
```

## Project Structure

```
src/
  app/              # Next.js App Router
    layout.tsx      # Root layout (dark theme, Hungarian)
    page.tsx        # Main page with canvas
    globals.css     # Global styles
  components/
    canvas/         # React Flow canvas
      Canvas.tsx    # Main infinite canvas component
      ContextMenu.tsx # Right-click node menu
    nodes/          # Custom node components
      TextNode.tsx  # Editable text notes
      YouTubeNode.tsx # YouTube video embeds
      ImageNode.tsx # Image display from URL
    sidebar/        # Sidebar navigation
      Sidebar.tsx   # Board list + node toolbox
  lib/
    utils.ts        # cn() utility
    prisma.ts       # Prisma client singleton
  types/
    board.ts        # TypeScript types
prisma/
  schema.prisma     # Database schema
```
