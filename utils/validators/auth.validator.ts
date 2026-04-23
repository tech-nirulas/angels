import { LoginRequest, SignupRequest } from "@/interfaces/auth.interface";
import * as Yup from "yup";

class AuthValidator {
  static loginSchema: Yup.ObjectSchema<LoginRequest> = Yup.object({
    email: Yup.string().email("Invalid email").required("Email is required"),
    password: Yup.string().required("Password is required"),
  });
  static signUpSchema: Yup.ObjectSchema<SignupRequest> = Yup.object({
    firstName: Yup.string().required("First name is required"),
    lastName: Yup.string().required("Last name is required"),
    email: Yup.string().email("Invalid email").required("Email is required"),
    phone: Yup.string().required("Phone is required"),
    password: Yup.string().required("Password is required"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password")], "Passwords must match")
      .required("Confirm Password is required"),
  });
}

export default AuthValidator;
