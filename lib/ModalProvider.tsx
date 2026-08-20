"use client";

import CloseIcon from '@mui/icons-material/Close';
import { Dialog, DialogContent, DialogTitle, IconButton } from '@mui/material';
import {
  createContext,
  FC,
  ReactNode,
  useCallback,
  useContext,
  useState,
} from 'react';

interface ModalProps {
  open: boolean;
  title?: string;
  content?: ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  fullScreen?: boolean;
  /**
   * Removes DialogContent's default padding so content can run edge-to-edge
   * (used by the product modal's full-bleed image panel).
   */
  disableContentPadding?: boolean;
  onClose: () => void;
}

interface ModalContextValue {
  openModal: (props: Omit<ModalProps, 'open' | 'onClose'>) => void;
  closeModal: () => void;
}

const ModalContext = createContext<ModalContextValue>({
  openModal: () => {},
  closeModal: () => {},
});

export const useModal = () => useContext(ModalContext);

interface ModalProviderProps {
  children: ReactNode;
}

export const ModalProvider: FC<ModalProviderProps> = ({ children }) => {
  const [modalProps, setModalProps] = useState<ModalProps>({
    open: false,
    title: '',
    content: null,
    maxWidth: 'xs', // Default size
    fullScreen: false, // Default non-fullscreen
    disableContentPadding: false,
    onClose: () => setModalProps((prev) => ({ ...prev, open: false })),
  });

  const openModal = useCallback(
    (props: Omit<ModalProps, 'open' | 'onClose'>) => {
      setModalProps({
        ...props,
        open: true,
        onClose: () => setModalProps((prev) => ({ ...prev, open: false })),
      });
    },
    [setModalProps]
  );

  const closeModal = useCallback(() => {
    setModalProps((prev) => ({
      ...prev,
      open: false,
    }));
  }, [setModalProps]);

  return (
    <ModalContext.Provider value={{ openModal, closeModal }}>
      {children}
      <Dialog
        open={modalProps.open}
        onClose={modalProps.onClose}
        maxWidth={modalProps.maxWidth}
        fullScreen={modalProps.fullScreen}
        fullWidth
        slotProps={{
          paper: {
            sx: { borderRadius: modalProps.fullScreen ? 0 : 3, overflow: 'hidden' },
          },
        }}
      >
        {modalProps.title ? (
          <DialogTitle>
            {modalProps.title}
            <IconButton
              aria-label="close"
              onClick={modalProps.onClose}
              color="primary"
              sx={{ position: 'absolute', right: 8, top: 8 }}
            >
              <CloseIcon color="primary" />
            </IconButton>
          </DialogTitle>
        ) : (
          // Untitled modals still need a close affordance; float it over the
          // content instead of reserving an empty title bar.
          <IconButton
            aria-label="close"
            onClick={modalProps.onClose}
            sx={{
              position: 'absolute',
              right: 10,
              top: 10,
              zIndex: 2,
              bgcolor: 'rgba(255,255,255,0.92)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.16)',
              '&:hover': { bgcolor: '#fff' },
            }}
            size="small"
          >
            <CloseIcon fontSize="small" color="primary" />
          </IconButton>
        )}
        <DialogContent
          sx={modalProps.disableContentPadding ? { p: 0, '&.MuiDialogContent-root': { p: 0 } } : undefined}
        >
          {modalProps.content}
        </DialogContent>
      </Dialog>
    </ModalContext.Provider>
  );
};
