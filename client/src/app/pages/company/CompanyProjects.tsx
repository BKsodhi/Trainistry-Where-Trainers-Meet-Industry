import React, { useEffect, useState } from 'react';
import { apiClient } from '../../utils/apiClient';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Briefcase, Calendar, DollarSign, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router';

interface Project {
  _id: string;
  title: string;
  description: string;
  requiredSkills: string[];
  durationInDays: number;
  mode: string;
  location: string;
  budgetMin: number;
  budgetMax: number;
  status: 'OPEN' | 'FILLED' | 'CANCELLED';
  createdAt: string;
}

export default function CompanyProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMyProjects = async () => {
      try {
        // Querying the existing search endpoint scoped to the current user
        const response = await apiClient('/marketplace/search?mine=true');
        if (response.success && response.data && response.data.results) {
          setProjects(response.data.results);
        }
      } catch (error) {
        console.error('Error fetching company project listings:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMyProjects();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 w-full items-center justify-center text-sm text-muted-foreground">
        Loading project tracking index...
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="flex h-96 flex-col items-center justify-center rounded-lg border border-dashed border-border p-8 text-center bg-[var(--card)] mt-5 max-w-5xl mx-auto">
        <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold tracking-tight text-foreground">No training requirements posted</h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-sm">
          Publish your first corporate requirement inside the Hiring Pipeline to source elite technical trainers.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">My Requirements Board</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Monitor and track all your posted training engagements and baseline scopes.
        </p>
      </div>

      <div className="grid gap-4 w-full">
        {projects.map((project) => (
          <Card key={project._id} className="border border-border bg-[var(--card)] shadow-sm hover:border-muted-foreground/30 transition-colors">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
              <div className="space-y-1 pr-4">
                <CardTitle className="text-xl font-bold text-foreground hover:text-primary transition-colors cursor-pointer" onClick={() => navigate('/company/pipeline')}>
                  {project.title}
                </CardTitle>
                <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                  Posted on {new Date(project.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
              </div>
              <Badge className={`uppercase text-xs font-semibold px-2.5 py-0.5 pointer-events-none ${
                project.status === 'OPEN' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-muted text-muted-foreground border-border'
              }`}>
                {project.status}
              </Badge>
            </CardHeader>

            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                {project.description}
              </p>

              {/* Technical Framework Badges */}
              <div className="flex flex-wrap gap-1.5">
                {project.requiredSkills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="text-xs font-medium uppercase bg-secondary/50 text-foreground border-border">
                    {skill}
                  </Badge>
                ))}
              </div>

              {/* Horizontal Metadata Metrics Strip */}
              <div className="flex flex-wrap items-center gap-y-2 gap-x-6 pt-2 border-t border-border/50 text-xs font-medium text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <DollarSign className="h-4 w-4 text-muted-foreground/70" />
                  <span className="mono text-foreground">₹{project.budgetMin.toLocaleString()} - ₹{project.budgetMax.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-muted-foreground/70" />
                  <span className="text-foreground">{project.durationInDays} Delivery Days ({project.mode})</span>
                </div>
              </div>

              {/* Action Vector Section */}
              <div className="flex justify-end pt-2">
                <Button variant="outline" size="sm" className="gap-1.5 text-xs font-semibold text-foreground border-border hover:bg-secondary" onClick={() => navigate('/company/pipeline')}>
                  Track Pipeline Applications
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
