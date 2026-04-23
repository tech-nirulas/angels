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
      >
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
        <DialogContent>{modalProps.content}</DialogContent>
      </Dialog>
    </ModalContext.Provider>
  );
};
