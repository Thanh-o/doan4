import React from 'react';
import { Card, CardContent, Typography, Box, Grid } from '@mui/material';

const StatisticsCard = ({ title, value, increase, icon, onClick }) => {
    return (
        <Grid item xs={12} sm={6} md={3}>
            <Card onClick={onClick} style={{ cursor: 'pointer' }}>
                <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {icon}
                        <Box sx={{ ml: 2 }}>
                            <Typography variant="h5">{value}</Typography>
                            <Typography variant="body2">{title}</Typography>
                            <Typography variant="body2" color="textSecondary">
                                {increase}
                            </Typography>
                        </Box>
                    </Box>
                </CardContent>
            </Card>
        </Grid>
    );
};

export default StatisticsCard;
