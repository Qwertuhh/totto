import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import TagInput from "@/components/tagsInput";
import { toast } from "react-toastify";
import { Bounce } from "react-toastify";

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters." }),
  skills: z
    .array(z.string())
    .min(1, { message: "Please select at least one skill." }).max(35, {
      message: "You can select a maximum of 35 skills.",
    }),
});

function SignUp() {
  const navigate = useNavigate();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", email: "", password: "", skills: ["React"] },
  });
  const [tags, setTags] = useState<string[]>(["React"]);
  const [loading, setLoading] = useState(false);

  // Sync tags with form's skills field
  useEffect(() => {
    form.setValue("skills", tags, { shouldValidate: true });
  }, [tags, form]);

  /**
   * Handles the form submission.
   * @param {z.infer<typeof formSchema>} values
   * The form values with the following properties:
   * - name: string
   * - email: string
   * - password: string
   * - skills: string[]
   * @returns {Promise<void>}
   */
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SERVER_URL}/user/auth/signup`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...values,
            email: values.email.toLowerCase(),
          }),
        }
      );

      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        navigate("/login");
      } else {
        form.setError("root", {
          type: "manual",
          message: data.message || "Something went wrong",
        });
      }
    } catch (error) {
      form.setError("root", {
        type: "manual",
        message:
          error instanceof Error ? error.message : "Network error occurred",
      });
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    toast.error( form.formState.errors.root?.message?.toString(), {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
      transition: Bounce,
    });

  }, [ form.formState.errors.root])

  return (
    <div className="flex h-screen items-center justify-center">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Create your account</CardTitle>
          <CardDescription>Enter your details below to sign up</CardDescription>
          <CardAction>
            <Button
              variant="link"
              onClick={() => navigate("/login")}
              className="text-sm cursor-pointer"
            >
              Login
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Enter your password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="skills"
                render={() => (
                  <FormItem>
                    <FormLabel>Skills</FormLabel>
                    <FormControl>
                      <TagInput tags={tags} setTags={setTags} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className={`w-full ${
                  loading ? "cursor-not-allowed" : "cursor-pointer"
                }`}
                disabled={loading}
              >
                {loading ? "Loading..." : "Sign Up"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

export default SignUp;
