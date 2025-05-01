"use client";

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ALL_COUNTRIES, getRegionByCountry, Region, Currency, REGIONS } from '@/lib/constants/regions';
import { getPhoneCodeForCountry } from '@/utils/phone-utils';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import Link from 'next/link';

// Schéma de validation Zod
const registerSchema = z.object({
  region: z.nativeEnum(Region, {
    required_error: "Veuillez sélectionner votre région"
  }),
  currency: z.nativeEnum(Currency, {
    required_error: "Veuillez sélectionner votre devise"
  }),
  first_name: z.string()
    .min(2, "Le prénom doit contenir au moins 2 caractères")
    .max(50, "Le prénom ne peut pas dépasser 50 caractères"),
  last_name: z.string()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(50, "Le nom ne peut pas dépasser 50 caractères"),
  email: z.string()
    .email("Adresse email invalide"),
  password: z.string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères")
    .regex(/[A-Z]/, "Le mot de passe doit contenir au moins une majuscule")
    .regex(/[a-z]/, "Le mot de passe doit contenir au moins une minuscule")
    .regex(/[0-9]/, "Le mot de passe doit contenir au moins un chiffre"),
  confirm_password: z.string(),
  phone_number: z.string().optional(),
  birthdate: z.string().optional(),
  country: z.string().min(1, "Veuillez sélectionner votre pays"),
  referral_code: z.string().optional(),
  accept_terms: z.boolean().refine(val => val === true, {
    message: "Vous devez accepter les conditions d'utilisation"
  })
}).refine((data) => data.password === data.confirm_password, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirm_password"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export function RegistrationForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);

  // Récupérer le code de parrainage depuis l'URL s'il existe
  const referral_code = searchParams?.get('ref') || '';

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      password: "",
      confirm_password: "",
      phone_number: "",
      birthdate: "",
      country: "",
      region: Region.EUROPE,
      currency: Currency.EUR,
      referral_code: referral_code,
      accept_terms: false,
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    if (step === 1) {
      // Valider les champs de la première étape
      const { email, password, confirm_password, first_name, last_name } = data;
      if (!email || !password || !confirm_password || !first_name || !last_name) {
        toast({
          title: "Erreur",
          description: "Veuillez remplir tous les champs obligatoires",
          variant: "destructive",
        });
        return;
      }
      setStep(2);
      return;
    }

    setIsLoading(true);
    try {
      // Transformer les données en camelCase pour l'API
      const apiData = {
        email: data.email,
        password: data.password,
        firstName: data.first_name,
        lastName: data.last_name,
        phoneNumber: data.phone_number,
        birthdate: data.birthdate,
        country: data.country,
        region: data.region,
        currency: data.currency,
        acceptTerms: data.accept_terms,
        referralCode: data.referral_code
      };

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Une erreur est survenue');
      }

      toast({
        title: "Inscription réussie !",
        description: result.message || "Votre compte a été créé avec succès.",
      });

      // Redirection vers l'URL fournie par l'API ou vers le tableau de bord par défaut
      if (result.redirectUrl) {
        router.push(result.redirectUrl);
      } else {
        // Fallback vers le tableau de bord si aucune URL de redirection n'est fournie
        router.push('/dashboard');
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Une erreur est survenue",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep1 = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="first_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">Prénom</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Votre prénom" 
                  {...field} 
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="last_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">Nom</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Votre nom" 
                  {...field} 
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-white">Email</FormLabel>
            <FormControl>
              <Input 
                placeholder="votre@email.com" 
                type="email" 
                {...field} 
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">Mot de passe</FormLabel>
              <FormControl>
                <Input 
                  placeholder="********" 
                  type="password" 
                  {...field} 
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                />
              </FormControl>
              <FormDescription className="text-white/60 text-xs">
                Au moins 8 caractères avec une majuscule, une minuscule et un chiffre
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirm_password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">Confirmer le mot de passe</FormLabel>
              <FormControl>
                <Input 
                  placeholder="********" 
                  type="password" 
                  {...field} 
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <Button 
        type="button"
        className="w-full bg-purple-600 hover:bg-purple-700 text-white"
        onClick={() => {
          const { email, password, confirm_password, first_name, last_name } = form.getValues();
          if (!email || !password || !confirm_password || !first_name || !last_name) {
            toast({
              title: "Erreur",
              description: "Veuillez remplir tous les champs obligatoires",
              variant: "destructive",
            });
            return;
          }
          setStep(2);
        }}
      >
        Continuer
      </Button>
    </>
  );

  const renderStep2 = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="country"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">Pays</FormLabel>
              <Select onValueChange={(value) => {
                field.onChange(value);
                
                // Mettre à jour la région et la devise en fonction du pays
                const region = getRegionByCountry(value);
                if (region) {
                  form.setValue("region", region);
                  const config = REGIONS[region];
                  form.setValue("currency", config.currency as Currency);
                }
                
                // Ajouter l'indicatif téléphonique au champ téléphone
                const phoneCode = getPhoneCodeForCountry(value);
                const currentPhone = form.getValues("phone_number") || "";
                
                // Ne pas modifier si le champ est déjà rempli avec un indicatif
                if (!currentPhone.startsWith('+')) {
                  // Si le champ est vide ou ne commence pas par +, ajouter l'indicatif
                  form.setValue("phone_number", phoneCode + " ");
                }
              }} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="Sélectionnez votre pays" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {ALL_COUNTRIES.map((country) => (
                    <SelectItem key={country.code} value={country.code}>
                      {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">Téléphone (optionnel)</FormLabel>
              <FormControl>
                <Input 
                  placeholder="+33 6 12 34 56 78" 
                  {...field} 
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      {/* Le champ de date de naissance a été temporairement retiré */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="region"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">Région</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="Sélectionnez votre région" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.entries(REGIONS).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      {config.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="currency"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">Devise</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="Sélectionnez votre devise" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.values(Currency).map((currency) => (
                    <SelectItem key={currency} value={currency}>
                      {currency}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="referral_code"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-white">Code de parrainage (optionnel)</FormLabel>
            <FormControl>
              <Input 
                placeholder="Code de parrainage" 
                {...field} 
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="accept_terms"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
                className="border-white/50 data-[state=checked]:bg-purple-600"
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel className="text-white">
                J'accepte les{' '}
                <Link href="/terms" className="text-purple-400 hover:text-purple-300 hover:underline">
                  conditions d'utilisation
                </Link>
              </FormLabel>
              <FormMessage />
            </div>
          </FormItem>
        )}
      />

      <div className="flex gap-4">
        <Button
          type="button"
          variant="outline"
          className="w-full border-white/20 text-white hover:bg-white/10"
          onClick={() => setStep(1)}
        >
          Retour
        </Button>
        <Button
          type="submit"
          className="w-full bg-purple-600 hover:bg-purple-700 text-white"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Création du compte...
            </div>
          ) : (
            "Créer mon compte"
          )}
        </Button>
      </div>
    </>
  );

  return (
    <div className="w-full">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white text-center">
          {step === 1 ? "Créer un compte" : "Informations complémentaires"}
        </h2>
        <p className="text-white/80 text-center mt-2">
          {step === 1 
            ? "Rejoignez Bingoo et commencez à jouer dès aujourd'hui !"
            : "Quelques informations supplémentaires pour personnaliser votre expérience"
          }
        </p>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {step === 1 ? renderStep1() : renderStep2()}
        </form>
      </Form>
      
      <div className="mt-6 text-center">
        <p className="text-sm text-white/70">
          Déjà inscrit ?{' '}
          <Link href="/auth/login" className="text-purple-400 hover:text-purple-300 hover:underline">
            Connectez-vous
          </Link>
        </p>
      </div>
    </div>
  );
}
