import { Helmet } from "react-helmet-async";
import { Button } from "../../components/ui/button";
import { Label } from "../../components/ui/label";
import { Input } from "../../components/ui/input";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { Link, NavLink, useNavigate } from "react-router";
import { login } from "@/api/authentication/login";

const signInForm = z.object({
  email: z.email(),
  password: z.string(),
});

type SignInForm = z.infer<typeof signInForm>;

export function SignIn() {

  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<SignInForm>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function handleSignIn(data: SignInForm) {
    try {

      const response = await login({ email: data.email, password: data.password });

      console.log(response)
      toast.success("Login feito com sucesso");
      navigate("/");
    } catch {
      console.log("erro");
    }
  }

  return (
    <>
      <Helmet title="Login" />
      <div className="p-8">
        <Button variant="secondary" asChild className="absolute right-8 top-8">
          <Link to="/cadastrar">Cadastrar</Link>
        </Button>
        <div className="flex w-[350px] flex-col justify-center gap-6">
          <div className="flex flex-col gap-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Fazer Login
            </h1>
            <p className="text-muted-foreground text-sm">
              Crie seus temas com muito{" "}
              <span className="text-rose-400 font-bold">lovezao</span>
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit(handleSignIn)}>
            <div className="space-y-2">
              <Label htmlFor="email">Seu e-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="Ex: teamo@lovezao.com"
                {...register("email")}
              />
            </div>

            <p className="text-sm text-muted-foreground">
              Não tem uma conta?{" "}
              <NavLink
                className={"text-rose-400 italic underline font-bold"}
                to={"/cadastrar"}
              >
                cadastre-se
              </NavLink>
            </p>

            <Button
              className="w-full"
              variant={"destructive"}
              disabled={isSubmitting}
            >
              Receber Código
            </Button>
          </form>
        </div>
      </div>
    </>
  );
}
