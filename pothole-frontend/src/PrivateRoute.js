const PrivateRoute = ({ children, role }) => {
  const { user } = useAuth();
  if (!user || user.role !== role) return <Navigate to="/login" />;
  return children;
};
