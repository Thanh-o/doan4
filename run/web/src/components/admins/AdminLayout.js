// src/components/admins/AdminLayout.js

import React, { useState } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import {
    Box,
    AppBar,
    Toolbar,
    Typography,
    Button,
    CssBaseline,
    Modal,
} from '@mui/material';
import Sidebar from './Sidebar';
import FeedbackListWithReply from './FeedbackListWithReply';
import { useNavigate } from 'react-router-dom';

const lightTheme = createTheme({
    palette: {
        mode: 'light',
    },
});

const AdminLayout = ({ children }) => {
    const navigate = useNavigate();
    const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);

    const handleLogout = () => {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('role');
        localStorage.removeItem('adminId');
        navigate('/adminlogin');
    };

    const handleOpenDoctorsPage = () => {
        navigate('/doctors');
    };

    const handleOpenPatientsPage = () => {
        navigate('/patients');
    };

    const handleOpenAppointmentsPage = () => {
        navigate('/appointments');
    };

    const handleOpenStaffPage = () => {
        navigate('/staff');
    };

    const handleOpenFeedbackModal = () => {
        setIsFeedbackModalOpen(true);
    };

    const handleCloseFeedbackModal = () => {
        setIsFeedbackModalOpen(false);
    };

    return (
        <ThemeProvider theme={lightTheme}>
            <Box sx={{ display: 'flex' }}>
                <CssBaseline />
                <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
                    <Toolbar>
                        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
                            Admin Dashboard
                        </Typography>
                        <Button color="inherit" onClick={handleLogout}>
                            Logout
                        </Button>
                    </Toolbar>
                </AppBar>
                <Sidebar
                    onInboxClick={handleOpenFeedbackModal}
                    handleOpenDoctorsPage={handleOpenDoctorsPage}
                    handleOpenPatientsPage={handleOpenPatientsPage}
                    handleOpenAppointmentsPage={handleOpenAppointmentsPage}
                    handleOpenStaffPage={handleOpenStaffPage}
                />
                <Box component="main" sx={{ flexGrow: 1, bgcolor: 'background.default', p: 3, mt: 2 }}>
                    <Toolbar />
                    {children}
                </Box>
                <Modal
                    open={isFeedbackModalOpen}
                    onClose={handleCloseFeedbackModal}
                    aria-labelledby="modal-title"
                    aria-describedby="modal-description"
                    sx={{ overflowY: 'auto' }}
                >
                    <Box sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '80%',
                        maxHeight: '80%',
                        bgcolor: 'background.paper',
                        border: '2px solid #000',
                        boxShadow: 24,
                        p: 4,
                        overflowY: 'auto',
                    }}>
                        <FeedbackListWithReply onClose={handleCloseFeedbackModal} />
                    </Box>
                </Modal>
            </Box>
        </ThemeProvider>
    );
};

export default AdminLayout;
