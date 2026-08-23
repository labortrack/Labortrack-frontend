import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, ShieldAlert, UserPen, UserPlus } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { deactivateUserSchema, editUserSchema, createUserSchema, type CreateUserForm, type DeactivateUserForm, type EditUserForm } from "../schemas/usuarioSchemas";
import { useCreateUsuario, useDeactivateUsuario, useModifyUsuario } from "../hooks/useUsuarios";
import type { RolNombre, UserResponseDto } from "../types/usuario.types";
import { FormField, PasswordField } from "@/shared/components";
import { Alert, Button, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Spinner, Textarea } from "@/shared/ui";
import { normalizeApiError } from "@/shared/lib/http/apiError";

const roleOptions: Array<{ value: RolNombre; label: string }> = [
  { value: "ROLE_OPERARIO", label: "Operario" },
  { value: "ROLE_RRHH", label: "Recursos Humanos" },
  { value: "ROLE_ADMIN", label: "Administrador" },
];

function RoleSelect({ value, onChange }: { value: RolNombre; onChange: (value: RolNombre) => void }) {
  return <Select value={value} onValueChange={(next) => onChange(next as RolNombre)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{roleOptions.map((role) => <SelectItem key={role.value} value={role.value}>{role.label}</SelectItem>)}</SelectContent></Select>;
}

export function CreateUserDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const mutation = useCreateUsuario();
  const [submitError, setSubmitError] = useState<string>();
  const { register, control, reset, handleSubmit, formState: { errors } } = useForm<CreateUserForm>({ resolver: zodResolver(createUserSchema), defaultValues: { nombre: "", apellido: "", email: "", password: "", rol: "ROLE_OPERARIO" } });
  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) { reset(); setSubmitError(undefined); mutation.reset(); }
    onOpenChange(nextOpen);
  };

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(undefined);
    try { await mutation.mutateAsync(values); toast.success("Usuario creado exitosamente."); handleOpenChange(false); }
    catch (error) { setSubmitError(normalizeApiError(error, "No se pudo crear el usuario.").message); }
  });

  return <Dialog open={open} onOpenChange={handleOpenChange}><DialogContent><DialogHeader><div className="flex items-center gap-3"><span className="flex size-10 items-center justify-center rounded-lg bg-primary text-white"><UserPlus className="size-5" /></span><div><DialogTitle>Nuevo usuario</DialogTitle><DialogDescription>Registrar un nuevo acceso al sistema.</DialogDescription></div></div></DialogHeader>{submitError ? <Alert variant="error" className="mb-4"><AlertCircle className="mt-0.5 size-4" />{submitError}</Alert> : null}<form onSubmit={onSubmit} className="space-y-4" noValidate><div className="grid gap-4 sm:grid-cols-2"><FormField id="create-name" label="Nombre" error={errors.nombre?.message} required><Input id="create-name" aria-invalid={Boolean(errors.nombre)} {...register("nombre")} /></FormField><FormField id="create-lastname" label="Apellido" error={errors.apellido?.message} required><Input id="create-lastname" aria-invalid={Boolean(errors.apellido)} {...register("apellido")} /></FormField></div><FormField id="create-email" label="Correo electrónico" error={errors.email?.message} required><Input id="create-email" type="email" autoComplete="off" aria-invalid={Boolean(errors.email)} {...register("email")} /></FormField><FormField id="create-password" label="Contraseña inicial" error={errors.password?.message} hint="Mínimo 6 caracteres." required><PasswordField id="create-password" autoComplete="new-password" withIcon={false} aria-invalid={Boolean(errors.password)} {...register("password")} /></FormField><FormField id="create-role" label="Rol" error={errors.rol?.message} required><Controller control={control} name="rol" render={({ field }) => <RoleSelect value={field.value} onChange={field.onChange} />} /></FormField><DialogFooter><Button variant="ghost" onClick={() => handleOpenChange(false)} disabled={mutation.isPending}>Cancelar</Button><Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? <><Spinner className="text-white" />Guardando...</> : "Crear usuario"}</Button></DialogFooter></form></DialogContent></Dialog>;
}

export function EditUserDialog({ user, onOpenChange }: { user: UserResponseDto | null; onOpenChange: (open: boolean) => void }) {
  const mutation = useModifyUsuario();
  const [submitError, setSubmitError] = useState<string>();
  const { register, reset, handleSubmit, formState: { errors } } = useForm<EditUserForm>({ resolver: zodResolver(editUserSchema), defaultValues: { nombre: user?.nombre ?? "", apellido: user?.apellido ?? "" } });
  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) { reset(); setSubmitError(undefined); mutation.reset(); }
    onOpenChange(nextOpen);
  };
  const onSubmit = handleSubmit(async (values) => {
    if (!user) return;
    setSubmitError(undefined);
    try { await mutation.mutateAsync({ id: user.idUsuario, payload: values }); toast.success("Usuario actualizado correctamente."); handleOpenChange(false); }
    catch (error) { setSubmitError(normalizeApiError(error, "No se pudo modificar el usuario.").message); }
  });
  return <Dialog open={Boolean(user)} onOpenChange={handleOpenChange}><DialogContent><DialogHeader><div className="flex items-center gap-3"><span className="flex size-10 items-center justify-center rounded-lg bg-primary-soft text-primary"><UserPen className="size-5" /></span><div><DialogTitle>Modificar usuario</DialogTitle><DialogDescription>{user?.email}</DialogDescription></div></div></DialogHeader>{submitError ? <Alert variant="error" className="mb-4"><AlertCircle className="mt-0.5 size-4" />{submitError}</Alert> : null}<form onSubmit={onSubmit} className="space-y-4" noValidate><div className="grid gap-4 sm:grid-cols-2"><FormField id="edit-name" label="Nombre" error={errors.nombre?.message} required><Input id="edit-name" aria-invalid={Boolean(errors.nombre)} {...register("nombre")} /></FormField><FormField id="edit-lastname" label="Apellido" error={errors.apellido?.message} required><Input id="edit-lastname" aria-invalid={Boolean(errors.apellido)} {...register("apellido")} /></FormField></div><p className="text-xs text-foreground-muted">El contrato actual del backend permite modificar únicamente nombre y apellido.</p><DialogFooter><Button variant="ghost" onClick={() => handleOpenChange(false)} disabled={mutation.isPending}>Cancelar</Button><Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? <><Spinner className="text-white" />Guardando...</> : "Guardar cambios"}</Button></DialogFooter></form></DialogContent></Dialog>;
}

function localDate() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function DeactivateUserDialog({ user, onOpenChange }: { user: UserResponseDto | null; onOpenChange: (open: boolean) => void }) {
  const mutation = useDeactivateUsuario();
  const [submitError, setSubmitError] = useState<string>();
  const { register, reset, handleSubmit, formState: { errors } } = useForm<DeactivateUserForm>({ resolver: zodResolver(deactivateUserSchema), defaultValues: { motivo: "" } });
  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) { reset(); setSubmitError(undefined); mutation.reset(); }
    onOpenChange(nextOpen);
  };
  const onSubmit = handleSubmit(async ({ motivo }) => {
    if (!user) return;
    setSubmitError(undefined);
    try { await mutation.mutateAsync({ id: user.idUsuario, payload: { motivo, fechaBaja: localDate() } }); toast.success("Usuario dado de baja correctamente."); handleOpenChange(false); }
    catch (error) { setSubmitError(normalizeApiError(error, "No se pudo dar de baja el usuario.").message); }
  });
  return <Dialog open={Boolean(user)} onOpenChange={handleOpenChange}><DialogContent><DialogHeader><div className="flex items-center gap-3"><span className="flex size-10 items-center justify-center rounded-lg bg-error-soft text-error"><ShieldAlert className="size-5" /></span><div><DialogTitle>Dar de baja usuario</DialogTitle><DialogDescription>Esta acción deshabilitará el acceso al sistema.</DialogDescription></div></div></DialogHeader>{submitError ? <Alert variant="error" className="mb-4"><AlertCircle className="mt-0.5 size-4" />{submitError}</Alert> : null}<p className="mb-4 text-sm text-foreground-muted">Vas a dar de baja a <strong className="text-foreground">{user?.nombre} {user?.apellido}</strong> ({user?.email}).</p><form onSubmit={onSubmit} className="space-y-4" noValidate><FormField id="deactivation-reason" label="Motivo de la baja" error={errors.motivo?.message} required><Textarea id="deactivation-reason" rows={3} aria-invalid={Boolean(errors.motivo)} placeholder="Indicá la razón de la baja..." {...register("motivo")} /></FormField><DialogFooter><Button variant="ghost" onClick={() => handleOpenChange(false)} disabled={mutation.isPending}>Cancelar</Button><Button type="submit" variant="destructive" disabled={mutation.isPending}>{mutation.isPending ? <><Spinner className="text-white" />Procesando...</> : "Confirmar baja"}</Button></DialogFooter></form></DialogContent></Dialog>;
}
