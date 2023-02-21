provider "aws" {
  profile = var.aws_profile
  region  = var.aws_region
}


locals {
  bucket_name = "${lower(var.project_name)}-${var.environment}-bucket"
}


resource "aws_s3_bucket" "b" {
  bucket = local.bucket_name
  force_destroy = true

  tags = {
    Name        = local.bucket_name
    Environment = var.environment
  }
}
