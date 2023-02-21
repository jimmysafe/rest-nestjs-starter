variable "aws_profile" {
  type        = string
  description = "AWS profile to use"
}

variable "aws_region" {
  type        = string
  description = "AWS region to use"
}

variable "environment" {
  type        = string
  description = "Staging or production (staging/prod)"
  validation {
    condition     = contains(["prod", "staging"], var.environment)
    error_message = "Must be one of 'staging' or 'prod'."
  }
}

variable "project_name" {
  type        = string
  description = "Name of project. e.g. limelight"
}


variable "callback_urls" {
  type        = list(string)
  description = "URLs to add to OAuth callbacks"
}

variable "email_code_name" {
  type        = string
  description = "Name to use in EMAIL verification messages"
}