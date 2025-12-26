"use client";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import FormInput from "@/components/FormInput";

const contactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactFormData = z.infer<typeof contactSchema>;

export default function ContactForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactFormData>({ resolver: zodResolver(contactSchema) });

  const onSubmit = (data: ContactFormData) => {
    console.log("Contact Form Submitted:", data);
    alert("Message Sent Successfully!");
  };

  return (
    <main className="p-6 flex flex-col items-center">
      <h1 className="text-xl font-bold mb-4">Contact Us</h1>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-96 bg-gray-50 p-6 border rounded-lg"
      >
        <FormInput label="Name" name="name" register={register} error={errors.name?.message as any} />
        <FormInput label="Email" name="email" type="email" register={register} error={errors.email?.message as any} />
        <FormInput label="Message" name="message" register={register} error={errors.message?.message as any} />
        <button className="bg-green-600 text-white px-4 py-2 mt-2 rounded hover:bg-green-700">Submit</button>
      </form>
    </main>
  );
}
