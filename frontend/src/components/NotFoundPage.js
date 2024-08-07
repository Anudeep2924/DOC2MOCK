import React from 'react';
import { Button, Container, Typography, Box } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import { useNavigate } from 'react-router-dom';
const NotFoundPage = () => {
    const navigate = useNavigate();
    const handleHomeClick = () => {
        navigate('/');
    };

    return (
        <Container
            sx={{
                textAlign: 'center',
                mt: 20,
                color: '#333',
            }}
        >
            <Box
                sx={{
                    fontSize: '10rem',
                    fontWeight: 'bold',
                    position: 'relative',
                }}
            >
                404
                <Box
                    component="span"
                    sx={{
                        position: 'absolute',
                        top: '30%',
                        left: '50%',
                        transform: 'translate(-50%, -30%)',
                        color: '#7a7a7a',
                    }}
                >
                    <Typography
                        component="span"
                        sx={{
                            fontSize: '5rem',
                            fontWeight: 'bold',
                        }}
                    >
                        &#x1f454;
                    </Typography>
                </Box>
            </Box>
            <Typography variant="h4" gutterBottom>
                The Page You're Looking For Cannot Be Found
            </Typography>
            <Typography variant="body1" sx={{ mb: 4 }}>
                We seem to have lost the page you were looking for. Perhaps you have imagined it?
            </Typography>
            <Button
                variant="contained"
                color="primary"
                startIcon={<HomeIcon />}
                onClick={handleHomeClick}
            >
                Home
            </Button>
        </Container>
    );
};

export default NotFoundPage;
