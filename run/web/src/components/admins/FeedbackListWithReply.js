import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Button,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Modal,
  TextField,
  Typography,
  Paper,
  Fade,
  IconButton,
  Snackbar,
  Alert,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import CloseIcon from "@mui/icons-material/Close";
import HistoryIcon from "@mui/icons-material/History";

const FeedbackListWithReply = ({ onClose }) => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [replyContent, setReplyContent] = useState("");
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyData, setHistoryData] = useState([]);

  useEffect(() => {
    // Tính ngày hiện tại và 7 ngày trước
    const today = new Date(); // 16/07/2025
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 7); // 09/07/2025

    // Định dạng ngày thành YYYY-MM-DD để gửi lên API
    const startDate = sevenDaysAgo.toISOString().split("T")[0]; // VD: 2025-07-09
    const endDate = today.toISOString().split("T")[0]; // VD: 2025-07-16

    console.log("Fetching feedbacks from", startDate, "to", endDate); // Debug

    // Gửi yêu cầu API với tham số startDate và endDate
    axios
      .get("http://localhost:8081/api/v1/feedback/list", {
        params: {
          startDate: startDate,
          endDate: endDate, // Thêm endDate để giới hạn đến ngày hiện tại
        },
      })
      .then((response) => {
        console.log("API response:", response.data); // Debug dữ liệu trả về
        if (response.data && Array.isArray(response.data)) {
          // Lọc thêm phía client để đảm bảo
          const filteredList = response.data
            .filter((fb) => {
              const createdAt = new Date(fb.created_at);
              return createdAt >= sevenDaysAgo && createdAt <= today;
            })
            .map((fb) => ({
              ...fb,
              replied: fb.replied || false,
            }));
          setFeedbacks(filteredList);
          if (filteredList.length === 0) {
            setError("No feedback found from 09/07/2025 to 16/07/2025.");
          }
        } else {
          setError("Invalid data format from server.");
        }
      })
      .catch((err) => {
        console.error("Error fetching feedbacks:", err);
        setError("Failed to fetch feedbacks. Please check the server.");
      });
  }, []);

  const handleReply = () => {
    if (!replyContent.trim()) {
      setError("Reply message cannot be empty.");
      return;
    }

    const emailData = {
      name: selectedFeedback.name,
      email: selectedFeedback.email,
      subject: `Re: ${selectedFeedback.subject}`,
      message: replyContent,
    };

    axios
      .post("http://localhost:8081/api/v1/feedback/reply", emailData)
      .then(() => {
        setFeedbacks((prev) =>
          prev.map((fb) =>
            fb.id === selectedFeedback.id
              ? { ...fb, replied: true, replyContent }
              : fb
          )
        );

        setSnackbarMessage("Reply sent successfully!");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);

        setSelectedFeedback(null);
        setReplyContent("");
        setError("");
      })
      .catch((err) => {
        console.error("Error sending reply:", err);
        setSnackbarMessage("Error sending reply");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      });
  };

  const openHistory = (fb) => {
    setHistoryData([
      {
        message: fb.replyContent || "No reply content available",
        timestamp: fb.replyTimestamp || "Unknown timestamp",
      },
    ]);
    setHistoryOpen(true);
  };

  const filteredFeedbacks = feedbacks.filter(
    (fb) =>
      fb.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fb.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Modal open={true} onClose={onClose} closeAfterTransition>
        <Fade in={true}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "95%",
              maxWidth: 1100,
              height: "85vh",
              display: "flex",
              bgcolor: "background.paper",
              borderRadius: 3,
              boxShadow: 24,
              overflow: "hidden",
              p: 1,
            }}
          >
            <Paper
              elevation={0}
              sx={{
                width: "35%",
                borderRight: "1px solid #ddd",
                overflowY: "auto",
                p: 2,
                bgcolor: "#f9f9f9",
              }}
            >
              <Typography variant="h6" gutterBottom>
                📬 Feedback (09/07/2025 - 16/07/2025)
              </Typography>
              <TextField
                label="Search name or email"
                variant="outlined"
                fullWidth
                size="small"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{ mb: 2 }}
              />
              <List>
                {error && (
                  <Typography sx={{ mt: 2, color: "error.main" }}>
                    {error}
                  </Typography>
                )}
                {filteredFeedbacks.length === 0 && !error ? (
                  <Typography sx={{ mt: 2, color: "gray" }}>
                    ❌ No matching feedbacks.
                  </Typography>
                ) : (
                  filteredFeedbacks.map((fb) => (
                    <ListItem
                      key={fb.id}
                      button
                      onClick={() => setSelectedFeedback(fb)}
                      selected={selectedFeedback?.id === fb.id}
                      sx={{
                        mb: 1,
                        borderRadius: 2,
                        bgcolor: fb.replied ? "#f1f8e9" : "inherit",
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: "#1976d2" }}>
                          <EmailIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={fb.name}
                        secondary={`📧 ${fb.email} | ${new Date(
                          fb.created_at
                        ).toLocaleDateString("vi-VN")}`}
                      />
                      {fb.replied && (
                        <Chip
                          label="Đã phản hồi"
                          color="success"
                          size="small"
                        />
                      )}
                      {fb.replied && (
                        <IconButton
                          size="small"
                          onClick={() => openHistory(fb)}
                        >
                          <HistoryIcon fontSize="small" />
                        </IconButton>
                      )}
                    </ListItem>
                  ))
                )}
              </List>
            </Paper>

            <Box
              sx={{ flex: 1, p: 4, position: "relative", overflowY: "auto" }}
            >
              <IconButton
                onClick={onClose}
                sx={{ position: "absolute", top: 16, right: 16, color: "#666" }}
              >
                <CloseIcon />
              </IconButton>

              {selectedFeedback ? (
                <>
                  <Typography
                    variant="h5"
                    gutterBottom
                    sx={{ fontWeight: 600 }}
                  >
                    ✉️ Feedback from {selectedFeedback.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Email: <strong>{selectedFeedback.email}</strong> | Date:{" "}
                    <strong>
                      {new Date(selectedFeedback.created_at).toLocaleString(
                        "vi-VN"
                      )}
                    </strong>
                  </Typography>
                  <Divider sx={{ my: 2 }} />

                  <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                    Subject: {selectedFeedback.subject}
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 1, mb: 4 }}>
                    {selectedFeedback.message}
                  </Typography>

                  <Typography variant="h6" sx={{ mt: 2 }}>
                    💬 Your Reply
                  </Typography>
                  <TextField
                    placeholder="Type your reply here..."
                    multiline
                    rows={5}
                    fullWidth
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    sx={{ mt: 1 }}
                  />

                  {error && (
                    <Typography color="error" sx={{ mt: 1 }}>
                      {error}
                    </Typography>
                  )}

                  <Box sx={{ mt: 3, textAlign: "right" }}>
                    <Button
                      variant="contained"
                      color="primary"
                      endIcon={<SendRoundedIcon />}
                      onClick={handleReply}
                      disabled={selectedFeedback.replied}
                      sx={{
                        px: 4,
                        py: 1.2,
                        borderRadius: "8px",
                        textTransform: "none",
                        fontWeight: 600,
                      }}
                    >
                      Send Reply
                    </Button>
                  </Box>
                </>
              ) : (
                <Box
                  sx={{ display: "flex", alignItems: "center", height: "100%" }}
                >
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ mx: "auto" }}
                  >
                    👈 Select a feedback to view and reply.
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        </Fade>
      </Modal>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>

      <Dialog
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Lịch sử phản hồi</DialogTitle>
        <DialogContent dividers>
          {historyData.map((item, index) => (
            <Box key={index} sx={{ mb: 2 }}>
              <Typography variant="subtitle2">{item.timestamp}</Typography>
              <Typography variant="body1">{item.message}</Typography>
            </Box>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHistoryOpen(false)} color="primary">
            Đóng
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default FeedbackListWithReply;