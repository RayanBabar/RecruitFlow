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

class RequirementCheck(BaseModel):
    requirement: str = Field(description="The specific requirement from the job description")
    meets_requirement: bool = Field(description="True if the candidate's resume satisfies this requirement, False otherwise")
    reason: str = Field(description="One-sentence reason justifying why the requirement was met or missed")

class ParsedResumeData(BaseModel):
    skills: List[str] = Field(description="List of technical and soft skills extracted")
    requirement_checks: List[RequirementCheck] = Field(description="Checklist evaluating whether the candidate meets specific requirements")
    education: List[EducationInfo] = Field(description="Educational background")
    experience: List[ExperienceInfo] = Field(description="Work experience")
    match_score: float = Field(description="Calculated match score from 0.0 to 100.0 based on the job description")
    feedback: str = Field(description="Justification for the match score and areas for improvement")
    resume_text: str = Field(default="", description="The raw extracted text from the resume")

class ScoreProfileRequest(BaseModel):
    resume_text: str = Field(description="The raw extracted text from the seeker's profile or resume")
    job_description: str = Field(description="The job description to match against")
