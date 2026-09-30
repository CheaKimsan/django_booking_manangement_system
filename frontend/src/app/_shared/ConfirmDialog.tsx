import {
  Dialog, DialogSurface, DialogTitle, DialogBody, DialogActions, Button,
} from "@fluentui/react-components";

interface Props {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
  loading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

const ConfirmDialog = ({
  open, title, message, confirmLabel = "Confirm", danger, loading, onCancel, onConfirm,
}: Props) => (
  <Dialog open={open}>
    <DialogSurface>
      <DialogBody>
        <DialogTitle>{title}</DialogTitle>
        <p>{message}</p>
        <DialogActions>
          <Button appearance="secondary" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button
            appearance="primary"
            style={danger ? { background: "#dc2626", borderColor: "#dc2626" } : undefined}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Please wait..." : confirmLabel}
          </Button>
        </DialogActions>
      </DialogBody>
    </DialogSurface>
  </Dialog>
);

export default ConfirmDialog;