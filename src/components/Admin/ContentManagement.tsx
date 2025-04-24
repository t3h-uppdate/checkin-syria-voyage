
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Loader2, PenSquare, Edit, Pencil, Eye, Plus, 
  Trash2, Images, File, FileText, Globe
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

type Page = {
  id: string;
  title: string;
  slug: string;
  status: 'draft' | 'published';
  lastUpdated: Date;
};

type FaqItem = {
  id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
};

const pageFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  content: z.string().min(10, "Content is required"),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  status: z.enum(['draft', 'published']),
});

const faqFormSchema = z.object({
  question: z.string().min(5, "Question is required"),
  answer: z.string().min(5, "Answer is required"),
  category: z.string().min(1, "Category is required"),
  order: z.number().int().min(0),
});

const ContentManagement = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [pages, setPages] = useState<Page[]>([
    { 
      id: '1', 
      title: 'About Us', 
      slug: 'about-us', 
      status: 'published', 
      lastUpdated: new Date() 
    },
    { 
      id: '2', 
      title: 'Contact', 
      slug: 'contact', 
      status: 'published', 
      lastUpdated: new Date(Date.now() - 86400000) 
    },
    { 
      id: '3', 
      title: 'FAQ', 
      slug: 'faq', 
      status: 'draft', 
      lastUpdated: new Date(Date.now() - 172800000) 
    },
  ]);
  
  const [faqs, setFaqs] = useState<FaqItem[]>([
    { 
      id: '1', 
      question: 'How do I make a reservation?', 
      answer: 'You can make a reservation by selecting a hotel and available room from our booking page.', 
      category: 'Booking', 
      order: 1 
    },
    { 
      id: '2', 
      question: 'What is the cancellation policy?', 
      answer: 'Most rooms can be cancelled up to 24 hours before arrival. Check the specific room policy during booking.', 
      category: 'Booking', 
      order: 2 
    },
    { 
      id: '3', 
      question: 'How do I become a hotel owner on the platform?', 
      answer: 'Register an account and request owner access from your profile. Our team will review your application.', 
      category: 'Hotels', 
      order: 1 
    },
  ]);
  
  const [editingPage, setEditingPage] = useState<Page | null>(null);
  const [editingFaq, setEditingFaq] = useState<FaqItem | null>(null);
  const [pageDialogOpen, setPageDialogOpen] = useState(false);
  const [faqDialogOpen, setFaqDialogOpen] = useState(false);

  const pageForm = useForm<z.infer<typeof pageFormSchema>>({
    resolver: zodResolver(pageFormSchema),
    defaultValues: {
      title: '',
      slug: '',
      content: '',
      metaTitle: '',
      metaDescription: '',
      status: 'draft',
    },
  });

  const faqForm = useForm<z.infer<typeof faqFormSchema>>({
    resolver: zodResolver(faqFormSchema),
    defaultValues: {
      question: '',
      answer: '',
      category: 'General',
      order: 0,
    },
  });

  const resetPageForm = () => {
    pageForm.reset({
      title: '',
      slug: '',
      content: '',
      metaTitle: '',
      metaDescription: '',
      status: 'draft',
    });
    setEditingPage(null);
  };

  const resetFaqForm = () => {
    faqForm.reset({
      question: '',
      answer: '',
      category: 'General',
      order: 0,
    });
    setEditingFaq(null);
  };

  const handleEditPage = (page: Page) => {
    setEditingPage(page);
    pageForm.reset({
      title: page.title,
      slug: page.slug,
      content: 'This is the content for ' + page.title, // Simulated content
      metaTitle: page.title,
      metaDescription: 'Description for ' + page.title,
      status: page.status,
    });
    setPageDialogOpen(true);
  };

  const handleDeletePage = (id: string) => {
    setPages(pages.filter(page => page.id !== id));
    toast({
      title: "Page deleted",
      description: "The page has been successfully deleted.",
    });
  };

  const handleEditFaq = (faq: FaqItem) => {
    setEditingFaq(faq);
    faqForm.reset({
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      order: faq.order,
    });
    setFaqDialogOpen(true);
  };

  const handleDeleteFaq = (id: string) => {
    setFaqs(faqs.filter(faq => faq.id !== id));
    toast({
      title: "FAQ deleted",
      description: "The FAQ item has been successfully deleted.",
    });
  };

  const onSubmitPage = async (values: z.infer<typeof pageFormSchema>) => {
    setLoading(true);
    try {
      // In a real app, you would save to your backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (editingPage) {
        setPages(pages.map(page => 
          page.id === editingPage.id 
            ? { 
                ...page, 
                title: values.title, 
                slug: values.slug, 
                status: values.status, 
                lastUpdated: new Date() 
              } 
            : page
        ));
        toast({
          title: "Page updated",
          description: `"${values.title}" has been updated successfully.`,
        });
      } else {
        const newPage: Page = {
          id: Date.now().toString(),
          title: values.title,
          slug: values.slug,
          status: values.status,
          lastUpdated: new Date(),
        };
        setPages([...pages, newPage]);
        toast({
          title: "Page created",
          description: `"${values.title}" has been created successfully.`,
        });
      }
      
      resetPageForm();
      setPageDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save the page. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const onSubmitFaq = async (values: z.infer<typeof faqFormSchema>) => {
    setLoading(true);
    try {
      // In a real app, you would save to your backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (editingFaq) {
        setFaqs(faqs.map(faq => 
          faq.id === editingFaq.id 
            ? { 
                ...faq, 
                question: values.question, 
                answer: values.answer, 
                category: values.category, 
                order: values.order 
              } 
            : faq
        ));
        toast({
          title: "FAQ updated",
          description: "The FAQ item has been updated successfully.",
        });
      } else {
        const newFaq: FaqItem = {
          id: Date.now().toString(),
          question: values.question,
          answer: values.answer,
          category: values.category,
          order: values.order,
        };
        setFaqs([...faqs, newFaq]);
        toast({
          title: "FAQ created",
          description: "A new FAQ item has been added successfully.",
        });
      }
      
      resetFaqForm();
      setFaqDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save the FAQ item. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Content Management</h2>
        <p className="text-muted-foreground">
          Manage your website's content, pages, and FAQs
        </p>
      </div>

      <Tabs defaultValue="pages" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pages" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span>Pages</span>
          </TabsTrigger>
          <TabsTrigger value="faqs" className="flex items-center gap-2">
            <File className="h-4 w-4" />
            <span>FAQs</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pages">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Content Pages</CardTitle>
                <CardDescription>
                  Manage static pages on your website
                </CardDescription>
              </div>
              <Dialog open={pageDialogOpen} onOpenChange={setPageDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    onClick={() => {
                      resetPageForm();
                      setEditingPage(null);
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Page
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[700px]">
                  <DialogHeader>
                    <DialogTitle>{editingPage ? 'Edit Page' : 'Create New Page'}</DialogTitle>
                    <DialogDescription>
                      {editingPage 
                        ? 'Update the details of your page' 
                        : 'Add a new page to your website'}
                    </DialogDescription>
                  </DialogHeader>
                  
                  <Form {...pageForm}>
                    <form onSubmit={pageForm.handleSubmit(onSubmitPage)} className="space-y-4 py-4">
                      <FormField
                        control={pageForm.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Page Title</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={pageForm.control}
                        name="slug"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>URL Slug</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormDescription>
                              The page URL will be: yoursite.com/{field.value}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={pageForm.control}
                        name="content"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Content</FormLabel>
                            <FormControl>
                              <Textarea rows={8} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={pageForm.control}
                          name="metaTitle"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Meta Title</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormDescription>
                                SEO title for search engines
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={pageForm.control}
                          name="metaDescription"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Meta Description</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormDescription>
                                SEO description for search engines
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={pageForm.control}
                        name="status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Status</FormLabel>
                            <FormControl>
                              <Select 
                                value={field.value} 
                                onValueChange={(value) => field.onChange(value as 'draft' | 'published')}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="draft">Draft</SelectItem>
                                  <SelectItem value="published">Published</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <DialogFooter>
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => {
                            resetPageForm();
                            setPageDialogOpen(false);
                          }}
                        >
                          Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          {editingPage ? 'Update Page' : 'Create Page'}
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>URL</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pages.map((page) => (
                    <TableRow key={page.id}>
                      <TableCell className="font-medium">{page.title}</TableCell>
                      <TableCell>/{page.slug}</TableCell>
                      <TableCell>
                        {page.status === 'published' ? (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            Published
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                            Draft
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>{page.lastUpdated.toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleEditPage(page)}>
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">Preview</span>
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-red-500 hover:text-red-700"
                            onClick={() => handleDeletePage(page.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {pages.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No pages found. Create your first page.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="faqs">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Frequently Asked Questions</CardTitle>
                <CardDescription>
                  Manage FAQs for your website
                </CardDescription>
              </div>
              <Dialog open={faqDialogOpen} onOpenChange={setFaqDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    onClick={() => {
                      resetFaqForm();
                      setEditingFaq(null);
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add FAQ
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>{editingFaq ? 'Edit FAQ' : 'Create New FAQ'}</DialogTitle>
                    <DialogDescription>
                      {editingFaq 
                        ? 'Update the details of this FAQ item' 
                        : 'Add a new question and answer to your FAQs'}
                    </DialogDescription>
                  </DialogHeader>
                  
                  <Form {...faqForm}>
                    <form onSubmit={faqForm.handleSubmit(onSubmitFaq)} className="space-y-4 py-4">
                      <FormField
                        control={faqForm.control}
                        name="question"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Question</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={faqForm.control}
                        name="answer"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Answer</FormLabel>
                            <FormControl>
                              <Textarea rows={4} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={faqForm.control}
                          name="category"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Category</FormLabel>
                              <Select 
                                value={field.value} 
                                onValueChange={field.onChange}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="General">General</SelectItem>
                                  <SelectItem value="Booking">Booking</SelectItem>
                                  <SelectItem value="Hotels">Hotels</SelectItem>
                                  <SelectItem value="Account">Account</SelectItem>
                                  <SelectItem value="Payment">Payment</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={faqForm.control}
                          name="order"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Display Order</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  {...field} 
                                  value={field.value}
                                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                />
                              </FormControl>
                              <FormDescription>
                                Lower numbers display first
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <DialogFooter>
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => {
                            resetFaqForm();
                            setFaqDialogOpen(false);
                          }}
                        >
                          Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          {editingFaq ? 'Update FAQ' : 'Create FAQ'}
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Question</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Order</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {faqs.map((faq) => (
                    <TableRow key={faq.id}>
                      <TableCell className="font-medium">{faq.question}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{faq.category}</Badge>
                      </TableCell>
                      <TableCell>{faq.order}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleEditFaq(faq)}>
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-red-500 hover:text-red-700"
                            onClick={() => handleDeleteFaq(faq.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {faqs.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        No FAQs found. Add your first FAQ item.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ContentManagement;
