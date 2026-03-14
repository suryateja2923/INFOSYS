# COMPONENTS.md - React Components Documentation

Complete reference for all React components in Fitplan.ai.

## 📁 Component Structure

```
src/components/
├── ui/                          # Shadcn/UI + Custom Components
│   ├── Core UI Components (from shadcn/ui)
│   │   ├── button.tsx           # Button component
│   │   ├── card.tsx             # Card container
│   │   ├── dialog.tsx           # Modal dialog
│   │   ├── form.tsx             # Form wrapper
│   │   ├── input.tsx            # Text input
│   │   ├── select.tsx           # Dropdown select
│   │   ├── tabs.tsx             # Tab navigation
│   │   ├── label.tsx            # Form label
│   │   └── ... (40+ more)
│   │
│   └── Custom Fitness Components
│       ├── FitnessButton.tsx     # Primary CTA button
│       ├── FitnessCard.tsx       # Metric card display
│       ├── FitnessInput.tsx      # Input with label
│       ├── ModeChip.tsx          # Pill-shaped selector
│       ├── ProgressRing.tsx      # Circular progress
│       └── StepIndicator.tsx     # Step progress bar
│
├── dashboard/                   # Dashboard Components
│   ├── DashboardHeader.tsx      # Top navigation
│   ├── DashboardSidebar.tsx     # Left sidebar
│   ├── DietPanel.tsx            # Meal display
│   ├── MoodModeSelector.tsx     # Mood picker
│   ├── ProgressCharts.tsx       # Chart visualizations
│   ├── StatCard.tsx             # Stat display box
│   └── WorkoutPanel.tsx         # Workout display
│
├── NavLink.tsx                  # Navigation link
└── (Layout components)
```

## 🎨 UI Components (Shadcn/UI Library)

### Core Components

#### Button
```tsx
import { Button } from "@/components/ui/button"

// Usage
<Button>Click me</Button>
<Button variant="outline">Outline</Button>
<Button size="lg">Large</Button>
<Button disabled>Disabled</Button>
```

**Props**:
- `variant`: 'default' | 'outline' | 'ghost' | 'secondary'
- `size`: 'default' | 'sm' | 'lg'
- `disabled`: boolean
- `onClick`: function

---

#### Card
```tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

// Usage
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    Content goes here
  </CardContent>
</Card>
```

---

#### Input
```tsx
import { Input } from "@/components/ui/input"

// Usage
<Input placeholder="Enter value" type="email" />
```

**Props**:
- `placeholder`: string
- `type`: 'text' | 'email' | 'password' | 'number' | 'date'
- `value`: string
- `onChange`: function
- `disabled`: boolean

---

#### Select
```tsx
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Usage
<Select value={value} onValueChange={setValue}>
  <SelectTrigger>
    <SelectValue placeholder="Select option" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
    <SelectItem value="option2">Option 2</SelectItem>
  </SelectContent>
</Select>
```

---

#### Form
```tsx
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useForm } from "react-hook-form"

// Usage
const form = useForm({ defaultValues: { email: "" } })

<Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)}>
    <FormField
      control={form.control}
      name="email"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Email</FormLabel>
          <FormControl>
            <Input type="email" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    <Button type="submit">Submit</Button>
  </form>
</Form>
```

---

### Navigation Components

#### Tabs
```tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Usage
<Tabs defaultValue="tab1">
  <TabsList>
    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
    <TabsTrigger value="tab2">Tab 2</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">Content 1</TabsContent>
  <TabsContent value="tab2">Content 2</TabsContent>
</Tabs>
```

---

#### Dialog
```tsx
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

// Usage
<Dialog open={open} onOpenChange={setOpen}>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
      <DialogDescription>Dialog description</DialogDescription>
    </DialogHeader>
    Content goes here
  </DialogContent>
</Dialog>
```

---

## 🏋️ Custom Fitness Components

### FitnessButton

**Purpose**: Primary action button with fitness app theme

```tsx
import { FitnessButton } from "@/components/ui/FitnessButton"

// Usage
<FitnessButton onClick={handleClick}>
  Generate Plan
</FitnessButton>

<FitnessButton disabled>Generating...</FitnessButton>
```

**Props**:
- `children`: React.ReactNode
- `onClick`: function
- `disabled`: boolean
- `className`: string

---

### FitnessCard

**Purpose**: Display metric cards (BMI, Calories, Protein, etc.)

```tsx
import { FitnessCard } from "@/components/ui/FitnessCard"

// Usage
<FitnessCard 
  title="BMI" 
  value="26.2" 
  icon={<BarChart3 />}
  status="normal"
/>
```

**Props**:
- `title`: string
- `value`: string | number
- `icon`: React element
- `status`: 'normal' | 'warning' | 'critical'
- `description`: string (optional)

---

### FitnessInput

**Purpose**: Input field with integrated label and styling

```tsx
import { FitnessInput } from "@/components/ui/FitnessInput"

// Usage
<FitnessInput 
  label="Age"
  type="number"
  value={age}
  onChange={(e) => setAge(e.target.value)}
  placeholder="Enter age"
  readOnly={false}
/>
```

**Props**:
- `label`: string
- `value`: string | number
- `onChange`: function
- `type`: 'text' | 'email' | 'number' | 'date' | 'password'
- `placeholder`: string
- `readOnly`: boolean

---

### ModeChip

**Purpose**: Pill-shaped selector for mood/mode selection

```tsx
import { ModeChip } from "@/components/ui/ModeChip"

// Usage
<div className="flex gap-2">
  <ModeChip 
    selected={selectedMode === 'energy'}
    onClick={() => setSelectedMode('energy')}
  >
    ⚡ High Energy
  </ModeChip>
  
  <ModeChip 
    selected={selectedMode === 'calm'}
    onClick={() => setSelectedMode('calm')}
  >
    😌 Calm Focus
  </ModeChip>
</div>
```

**Props**:
- `selected`: boolean
- `onClick`: function
- `children`: React.ReactNode
- `className`: string

---

### ProgressRing

**Purpose**: Circular progress indicator

```tsx
import { ProgressRing } from "@/components/ui/ProgressRing"

// Usage
<ProgressRing 
  percentage={65}
  label="65%"
  size="lg"
/>
```

**Props**:
- `percentage`: number (0-100)
- `label`: string
- `size`: 'sm' | 'md' | 'lg'
- `color`: 'success' | 'warning' | 'danger'

---

### StepIndicator

**Purpose**: Multi-step form progress indicator

```tsx
import { StepIndicator } from "@/components/ui/StepIndicator"

// Usage
<StepIndicator 
  currentStep={2}
  totalSteps={5}
  steps={['Info', 'Profile', 'Health', 'Review', 'Generate']}
/>
```

**Props**:
- `currentStep`: number
- `totalSteps`: number
- `steps`: string[]
- `onStepClick`: (step: number) => void (optional)

---

## 📊 Dashboard Components

### DashboardHeader

**Purpose**: Top navigation bar with user info

```tsx
import { DashboardHeader } from "@/components/dashboard/DashboardHeader"

// Usage
<DashboardHeader userName="John Doe" />
```

**Features**:
- User name display
- Notification bell
- Settings dropdown
- Profile menu

---

### DashboardSidebar

**Purpose**: Left navigation sidebar

```tsx
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar"

// Usage
<DashboardSidebar />
```

**Navigation Items**:
- Home
- Diet Plan
- Workout Plan
- Progress
- Reports
- Notifications
- Settings
- Logout

---

### DietPanel

**Purpose**: Display daily meals with two variants

```tsx
import { DietPanel } from "@/components/dashboard/DietPanel"

// Compact variant (home page)
<DietPanel variant="compact" />

// Detailed variant (diet plan page)
<DietPanel variant="detailed" />
```

**Compact Variant Shows**:
- Meal name
- Time, calories, protein, food type (horizontal)
- Dish description

**Detailed Variant Shows**:
- Complete meal info
- Time, calories, protein, food type
- Full dish description
- Green quantity section with:
  - Ingredient list
  - Specific amounts and units
  - Detailed macros

**Props**:
- `variant`: 'compact' | 'detailed'

---

### WorkoutPanel

**Purpose**: Display workout exercises

```tsx
import { WorkoutPanel } from "@/components/dashboard/WorkoutPanel"

// Usage
<WorkoutPanel />
```

**Displays**:
- Exercise name
- Sets & reps
- Duration
- Muscle group
- Difficulty level

---

### ProgressCharts

**Purpose**: Visualize fitness metrics over time

```tsx
import { ProgressCharts } from "@/components/dashboard/ProgressCharts"

// Usage
<ProgressCharts />
```

**Charts**:
- Weight change over time
- Calorie intake/burn
- BMI trend
- Workout completion

---

### StatCard

**Purpose**: Display individual metric

```tsx
import { StatCard } from "@/components/dashboard/StatCard"

// Usage
<StatCard 
  title="Calories" 
  value="2500"
  unit="kcal"
  icon={<Flame />}
  trend="up"
  trendValue="5%"
/>
```

**Props**:
- `title`: string
- `value`: string | number
- `unit`: string
- `icon`: React element
- `trend`: 'up' | 'down' | 'neutral'
- `trendValue`: string

---

### MoodModeSelector

**Purpose**: Let users select mood before workout

```tsx
import { MoodModeSelector } from "@/components/dashboard/MoodModeSelector"

// Usage
<MoodModeSelector 
  selectedMood={mood}
  onMoodChange={setMood}
/>
```

**Mood Options**:
- ⚡ Energetic
- 😌 Calm
- 💪 Focused
- 😴 Light

---

## 🔗 Navigation Components

### NavLink

**Purpose**: Navigation link with active state styling

```tsx
import { NavLink } from "@/components/NavLink"

// Usage
<NavLink 
  to="/dashboard/diet"
  icon={<Apple />}
  label="Diet Plan"
/>
```

**Props**:
- `to`: string (route)
- `icon`: React element
- `label`: string
- `active`: boolean (auto-detected with React Router)

---

## 📦 Component Dependencies

### Form Components Dependencies
```typescript
// React Hook Form
import { useForm, FormProvider } from "react-hook-form"

// Zod validation (used with RHF)
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
```

### State Management
```typescript
// Zustand store
import { useFitplanStore } from "@/store/fitplanStore"

// Usage
const { userProfile, setUserProfile } = useFitplanStore()
```

### Icons
```typescript
// Lucide React icons
import { Heart, Apple, Dumbbell, TrendingUp } from "lucide-react"
```

---

## 🎯 Component Usage Examples

### Complete Form Example

```tsx
"use client"

import { useState } from "react"
import { FitnessButton } from "@/components/ui/FitnessButton"
import { FitnessInput } from "@/components/ui/FitnessInput"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function ProfileForm() {
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    weight: ""
  })

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async () => {
    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })
      
      if (response.ok) {
        alert("Profile updated!")
      }
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Profile</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FitnessInput
          label="Name"
          value={formData.name}
          onChange={(e) => handleChange("name", e.target.value)}
          placeholder="Enter name"
        />
        
        <FitnessInput
          label="Age"
          type="number"
          value={formData.age}
          onChange={(e) => handleChange("age", e.target.value)}
          placeholder="Enter age"
        />
        
        <FitnessInput
          label="Weight (kg)"
          type="number"
          value={formData.weight}
          onChange={(e) => handleChange("weight", e.target.value)}
          placeholder="Enter weight"
        />
        
        <FitnessButton onClick={handleSubmit}>
          Save Changes
        </FitnessButton>
      </CardContent>
    </Card>
  )
}
```

### Grid Layout Example

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  <StatCard title="BMI" value="26.2" icon={<Activity />} />
  <StatCard title="Calories" value="2500" unit="kcal" icon={<Flame />} />
  <StatCard title="Protein" value="150" unit="g" icon={<Beef />} />
  <StatCard title="Water" value="8" unit="cups" icon={<Droplet />} />
</div>
```

---

## 🚀 Best Practices

1. **Always use TypeScript**: Define prop interfaces
2. **Handle Loading States**: Show skeleton or spinner
3. **Error Boundaries**: Wrap components in error handling
4. **Small Components**: Keep components focused and reusable
5. **Proper Key Props**: When rendering lists
6. **Accessibility**: Use semantic HTML, ARIA labels
7. **Performance**: Memoize expensive components with `React.memo`

---

**Components Version**: 1.0  
**Last Updated**: February 2026
