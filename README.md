# Cloudflare Worker for scraping free parking spots.

This application is a Cloudflare worker which has a task of scraping the number of free parking spots from a website. It runs on a schedule, every 30 minutes. It's job is to access a website which shows the free parking spots and save it to a database. All should run on Cloudflare Workers.
