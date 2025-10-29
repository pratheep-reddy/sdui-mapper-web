# SDUI Template Mapper

A web application for managing and viewing Server-Driven UI (SDUI) templates built with Next.js 16 and React 19.

## Features

- 🎨 **Beautiful Grid View**: Browse all your SDUI templates in a modern, responsive grid layout
- 📄 **Template Cards**: Each template displayed as an interactive card with the log_id as the card name
- 🔍 **Detail View**: Click on any template to view its complete JSON structure and metadata
- 🎯 **Auto-Detection**: Automatically scans for JSON files starting with `sdui_` prefix
- ✨ **Clean Light Mode UI**: Professional light theme with smooth transitions
- 🎭 **Live Preview**: DivKit renderer integration for real-time template preview

## Getting Started

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) - you'll be automatically redirected to the `/mapper` page.

### Project Structure

```
sdui-map-web/
├── src/
│   └── app/
│       ├── page.tsx              # Root page (redirects to /mapper)
│       └── mapper/
│           ├── page.tsx          # Main grid view of all templates
│           └── [templateId]/
│               └── page.tsx      # Individual template detail page
├── sdui_*.json                   # SDUI template JSON files (in root)
└── README.md
```

### Adding New Templates

To add a new SDUI template:

1. Create a new JSON file in the root directory
2. Name it with the `sdui_` prefix (e.g., `sdui_my_template.json`)
3. Ensure it has the following structure:

```json
{
  "card": {
    "log_id": "your_template_name",
    "states": [...],
    "variables": [...]
  }
}
```

The template will automatically appear in the mapper grid view, using the `log_id` value as the card name.

## Example Templates

The project includes example templates:

- `sdui_preferred_partners.json` - A gallery-based template for partner cards
- `sdui_featured_offers.json` - A simple featured offers template
- `sdui_popular_routes.json` - A popular routes listing template

## Tech Stack

- **Framework**: Next.js 16.0.1
- **React**: 19.2.0
- **Styling**: Tailwind CSS 4
- **Language**: TypeScript 5
- **Renderer**: @divkitframework/divkit (32.23.0) for live template preview
- **Code Editor**: @monaco-editor/react for JSON editing in dynamic mode

## Routes

- `/` - Redirects to `/mapper`
- `/mapper` - Main page showing all SDUI templates in grid view
- `/mapper/[templateId]` - Detail page for specific template with live preview

## DivKit Preview & Variable Editor

Each template detail page includes:

### Left Panel - Live Preview
- **Live Rendering**: Real-time visualization of your SDUI template powered by DivKit
- **Interactive Preview**: See exactly how your template will render
- **Error Handling**: Clear error messages if template rendering fails

### Right Panel - Variable Editor

**Static Mode** (Active):
- Edit template variables directly with form inputs
- **Array Variables**: Navigate through array items with Previous/Next buttons
  - Each array item's fields are extracted and shown as individual form inputs
  - Add or remove array items dynamically
  - Edit fields like `image_url`, `name`, `discount`, etc. individually
- **Simple Variables**: Direct input fields for strings, numbers, booleans
- **Update Preview**: Apply changes to see updated rendering

**Dynamic Mode**:
- **API Configuration**: Set endpoint URL and HTTP method (GET, POST, PUT, DELETE, PATCH)
- **Monaco Editors**: Edit Request and Response JSON with syntax highlighting
- **Response Path Auto-suggestions**: Click to insert response paths like `{{response.data.name}}`
- **Variable Mapping**: Map template variables to API response fields
- **Apply Mapping**: Transform static values to dynamic bindings (e.g., `"Purple Bus"` → `"{{response.data.name}}"`)
- Preloads example response structure for easy mapping

## Development

Built with:
- Server-side rendering for optimal performance
- Modern React Server Components
- Responsive design for all screen sizes
- Beautiful gradients and smooth transitions
- Client-side DivKit rendering for live previews
