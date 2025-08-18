# useSimpleDialog Hook

A custom React hook for managing dialog/modal state with a clean API.

## Usage

```tsx
import { useSimpleDialog } from "@/lib/useSimpleDialog"

function MyComponent() {
  const { show, hide, visible, DialogComponent } = useSimpleDialog({
    renderContent: <p>Are you sure you want to continue?</p>,
    confirmText: "Yes",
    cancelText: "No",
    showCancel: true,
    closable: true,
    onConfirm: () => {
      console.log("User confirmed!")
    },
    onCancel: () => {
      console.log("User cancelled!")
    },
  })

  return (
    <div>
      <button onClick={show}>Show Dialog</button>
      <DialogComponent />
    </div>
  )
}
```

## API

### Options

- `renderContent`: React node to render inside the dialog
- `confirmText`: Text for the confirm button (default: "Confirm")
- `cancelText`: Text for the cancel button (default: "Cancel")
- `showCancel`: Whether to show the cancel button (default: true)
- `closable`: Whether to show the close button (default: true)
- `onConfirm`: Callback when user confirms
- `onCancel`: Callback when user cancels

### Return Value

- `show`: Function to show the dialog
- `hide`: Function to hide the dialog
- `visible`: Boolean indicating if dialog is visible
- `DialogComponent`: React component to render the dialog

## Features

- Built on top of Radix UI Dialog components
- Automatic state management
- Customizable content and buttons
- Callback support for confirm/cancel actions
- TypeScript support
