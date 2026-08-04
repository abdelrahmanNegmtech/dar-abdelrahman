import { CreateAccountForm } from "./CreateAccountForm";

export function CreateAccountPage() {
  return (
    <main className="auth-create-account-screen min-h-dvh overflow-x-hidden bg-white px-5 py-6 sm:px-8 lg:h-dvh lg:overflow-hidden">
      <section className="mx-auto flex min-h-[calc(100dvh-48px)] w-full max-w-[446px] items-center justify-center lg:min-h-full">
        <CreateAccountForm />
      </section>
    </main>
  );
}
