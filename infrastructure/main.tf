
provider "aws" {
  region  = var.aws_region
  profile = var.aws_profile
}

module "auth" {
  source = "./modules/auth"

  aws_profile     = var.aws_profile
  aws_region      = var.aws_region
  environment     = var.environment
  project_name    = var.project_name
  email_code_name = "Anspi"
  callback_urls   = var.callback_urls
}

module "s3" {
  source = "./modules/s3"

  aws_profile     = var.aws_profile
  aws_region      = var.aws_region
  environment     = var.environment
  project_name    = var.project_name
}
