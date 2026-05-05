from pydantic import BaseModel, Field
from typing import List

class EducationInfo(BaseModel):
    degree: str = Field(description="Degree or certificate name")
    institution: str = Field(description="Name of the university or institution")
    year: str = Field(description="Graduation year or date range")

class ExperienceInfo(BaseModel):
    role: str = Field(description="Job title or role")
    company: str = Field(description="Company or organization name")
    duration: str = Field(description="Employment duration (e.g., '2020 - 2022')")
    description: str = Field(description="Brief summary of responsibilities and achievements")

class ParsedResumeData(BaseModel):
    skills: List[str] = Field(description="List of technical and soft skills extracted")
    education: List[EducationInfo] = Field(description="Educational background")
    experience: List[ExperienceInfo] = Field(description="Work experience")
    match_score: float = Field(description="Calculated match score from 0.0 to 100.0 based on the job description")
    feedback: str = Field(description="Justification for the match score and areas for improvement")
