import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Chip,
  Button,
  Stack,
  Card,
  CardContent,
  IconButton,
  Divider,
} from "@mui/material";
import { User } from "../../types/User";
import { Diet } from "../../types/Diet";
import { Workout } from "../../types/Workout";
import * as userService from "../../services/userService";
import * as dietService from "../../services/dietService";
import * as workoutService from "../../services/workoutService";
import { Iconify } from "../../utils/iconify";

export const UserDetailManager = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [userDiets, setUserDiets] = useState<Diet[]>([]);
  const [userWorkouts, setUserWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, [id]);

  const loadUserData = async () => {
    if (!id) return;

    try {
      setLoading(true);

      // Load user data
      const userData = await userService.getUser(parseInt(id));
      setUser(userData);

      // Load user's diets
      const allDiets = await dietService.getDiets();
      const dietsWithUsers = await Promise.all(
        allDiets.map(async (diet) => {
          const users = await dietService.getDietUsers(diet.id);
          return { diet, hasUser: users.some((u) => u.id === parseInt(id)) };
        })
      );
      setUserDiets(dietsWithUsers.filter((d) => d.hasUser).map((d) => d.diet));

      // Load user's workouts
      const allWorkouts = await workoutService.getWorkouts();
      const userWorkoutsList = allWorkouts.filter(
        (w) => w.user_id === parseInt(id)
      );
      setUserWorkouts(userWorkoutsList);
    } catch (error) {
      console.error("Error loading user data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container>
        <Typography>Cargando...</Typography>
      </Container>
    );
  }

  if (!user) {
    return (
      <Container>
        <Typography>Usuario no encontrado</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Button
          startIcon={<Iconify icon="eva:arrow-back-fill" />}
          onClick={() => navigate("/users")}
          sx={{ mb: 2 }}
        >
          Volver
        </Button>

        <Typography variant="h4" gutterBottom>
          Detalle del Usuario
        </Typography>
      </Box>

      {/* User Info Card */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h5" gutterBottom>
              {user.name}
            </Typography>
            <Stack spacing={1}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Iconify icon="eva:email-outline" />
                <Typography>{user.email}</Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Iconify icon="eva:shield-outline" />
                <Chip
                  label={user.role}
                  color={user.role === "admin" ? "error" : "primary"}
                  size="small"
                />
              </Box>
            </Stack>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ textAlign: { xs: "left", md: "right" } }}>
              <Typography variant="body2" color="text.secondary">
                ID: {user.id}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Stats Overview */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Dietas Asignadas
                  </Typography>
                  <Typography variant="h3">{userDiets.length}</Typography>
                </Box>
                <Iconify
                  icon="solar:dish-bold"
                  width={48}
                  sx={{ color: "primary.main" }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Rutinas Asignadas
                  </Typography>
                  <Typography variant="h3">{userWorkouts.length}</Typography>
                </Box>
                <Iconify
                  icon="solar:running-round-bold"
                  width={48}
                  sx={{ color: "success.main" }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Diets Section */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Dietas Asignadas
        </Typography>
        <Divider sx={{ mb: 2 }} />

        {userDiets.length === 0 ? (
          <Typography color="text.secondary">
            No hay dietas asignadas a este usuario
          </Typography>
        ) : (
          <Grid container spacing={2}>
            {userDiets.map((diet) => (
              <Grid item xs={12} md={6} key={diet.id}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {diet.name}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 1 }}
                    >
                      {diet.description}
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Iconify icon="solar:fire-bold" />
                      <Typography variant="body2">
                        {diet.total_calories} calorías
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>

      {/* Workouts Section */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Rutinas Asignadas
        </Typography>
        <Divider sx={{ mb: 2 }} />

        {userWorkouts.length === 0 ? (
          <Typography color="text.secondary">
            No hay rutinas asignadas a este usuario
          </Typography>
        ) : (
          <Grid container spacing={2}>
            {userWorkouts.map((workout) => (
              <Grid item xs={12} md={6} key={workout.id}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {workout.name}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 1 }}
                    >
                      {workout.notes || "Sin descripción"}
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Chip
                        label={workout.duration || "Sin duración"}
                        size="small"
                        icon={<Iconify icon="eva:clock-outline" />}
                      />
                      <Chip
                        label={workout.category}
                        size="small"
                        color="primary"
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>
    </Container>
  );
};
