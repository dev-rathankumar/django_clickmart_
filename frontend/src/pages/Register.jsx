import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  /* ===============================
     HANDLE INPUT CHANGE
  =============================== */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* ===============================
     HANDLE FORM SUBMIT
  =============================== */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Frontend validation
    if (
      !formData.username ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      setError("All fields are required");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setIsLoading(true);

    try {
      // ONLY send backend-required fields
      const payload = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
      };

      const response = await api.post("/register/", payload); // Register a new user

      if (response.status === 201) {
        setSuccess("Account created successfully.");
        setTimeout(() => navigate("/login"), 2000);
      }
    } catch (err) {
      console.log(err);
      if (err?.response?.data) {
        console.log(err);
        const apiError = err.response.data;

        // Handle DRF field errors nicely
        const message = Object.values(apiError).flat().join(" ");

        setError(message);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5">
            <div className="card auth-card">
              <div className="card-body">
                <div className="text-center mb-4">
                  <h2 className="fw-bold">Create Account</h2>
                </div>

                {error && (
                  <div className="alert alert-danger" role="alert">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="alert alert-success" role="alert">
                    {success}
                  </div>
                )}

                <form onSubmit={handleSubmit} noValidate>
                  {/* USERNAME */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Username</label>
                    <input
                      type="text"
                      className="form-control"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      placeholder="Enter username"
                      required
                    />
                  </div>

                  {/* EMAIL */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      Email Address
                    </label>
                    <input
                      type="email"
                      className="form-control"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter email"
                      required
                    />
                  </div>

                  {/* PASSWORD */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Password</label>
                    <input
                      type="password"
                      className="form-control"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Create password"
                      required
                    />
                  </div>

                  {/* CONFIRM PASSWORD (Frontend Only) */}
                  <div className="mb-4">
                    <label className="form-label fw-semibold">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      className="form-control"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm password"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary w-100"
                    disabled={isLoading}
                  >
                    {isLoading ? "Creating Account..." : "Create Account"}
                  </button>
                </form>

                <div className="text-center mt-3">
                  <p className="mb-0 text-muted">
                    Already have an account?{" "}
                    <Link to="/login" className="fw-semibold">
                      Sign in
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
