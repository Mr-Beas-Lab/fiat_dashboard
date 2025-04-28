import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Input } from '../ui/input';
import { Checkbox } from '../ui/checkbox';
import { getAdminById, updateAdmin } from '../../api/adminService';
import { toast } from '../../components/ui/use-toast';

const formSchema = z.object({
  firstName: z.string().min(2, {
    message: "First name must be at least 2 characters.",
  }),
  lastName: z.string().min(2, {
    message: "Last name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().optional(),
  phone: z.string().optional(),
  tgUsername: z.string().optional(),
  isActive: z.boolean().default(true),
});

type FormValues = z.infer<typeof formSchema>;

const AdminEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      phone: "",
      tgUsername: "",
      isActive: true,
    },
  });

  useEffect(() => {
    fetchAdmin();
  }, [id]);

  const fetchAdmin = async () => {
    if (!id) {
      setError("Admin ID not found");
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    try {
      const adminData = await getAdminById(id);
      
      form.reset({
        firstName: adminData.firstName || "",
        lastName: adminData.lastName || "",
        email: adminData.email || "",
        password: "", // We don't receive the password
        phone: adminData.phone || "",
        tgUsername: adminData.tgUsername || "",
        isActive: adminData.isActive || false,
      });
    } catch (error) {
      console.error('Error fetching admin data:', error);
      setError('Failed to load admin data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (values: FormValues) => {
    if (!id) return;
    
    setIsSubmitting(true);
    try {
      // Remove password if empty
      const adminData = { ...values };
      if (!adminData.password) {
        delete adminData.password;
      }

      await updateAdmin(id, adminData);
      
      toast({
        title: "Admin updated successfully",
        description: "The admin user has been updated.",
        variant: "default",
      });
      
      navigate('/superadmin-dashboard/admins');
    } catch (error) {
      console.error('Error updating admin:', error);
      toast({
        title: "Failed to update admin",
        description: "There was an error updating the admin user. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <Card className="bg-black border-gray-800 text-white">
          <CardContent className="flex justify-center items-center h-60">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <Card className="bg-black border-gray-800 text-white">
          <CardContent>
            <div className="bg-red-900 border border-red-700 text-white p-4 rounded-md">
              {error}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <Card className="bg-black border-gray-800 text-white">
        <CardHeader>
          <div className="flex items-center mb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/superadmin-dashboard/admins')}
              className="mr-2 text-white hover:bg-gray-800"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
          </div>
          <CardTitle className="text-2xl text-white">Edit Admin</CardTitle>
          <CardDescription className="text-gray-400">
            Update the admin user information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">First Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="John" 
                          {...field} 
                          className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-500" 
                        />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Last Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Doe" 
                          {...field} 
                          className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-500" 
                        />
                      </FormControl>
                      <FormMessage className="text-red-400" />
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
                        placeholder="john.doe@example.com" 
                        type="email" 
                        {...field} 
                        className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-500" 
                      />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Password</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Leave blank to keep current password" 
                        type="password" 
                        {...field} 
                        className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-500" 
                      />
                    </FormControl>
                    <FormDescription className="text-gray-400">
                      Enter a new password only if you want to change the current one
                    </FormDescription>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Phone Number</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Phone Number" 
                        {...field} 
                        className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-500" 
                      />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tgUsername"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Telegram Username</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="@username" 
                        {...field} 
                        className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-500" 
                      />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-gray-800 p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-white">
                        Active Status
                      </FormLabel>
                      <FormDescription className="text-gray-400">
                        Enable this to make the admin account active.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <div className="flex justify-end">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate('/superadmin-dashboard/admins')}
                  className="mr-2 border-gray-700 text-white hover:bg-gray-800"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="bg-gray-800 text-white hover:bg-gray-700"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Update Admin'
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminEdit; 