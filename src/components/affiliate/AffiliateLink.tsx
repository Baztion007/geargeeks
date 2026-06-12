'use client';

import React from 'react';
import { getAffiliateUrl, getAffiliateLinkProps, getMerchantName } from '@/lib/affiliate';
import { ExternalLink } from 'lucide-react';
import type { Merchant } from '@/lib/types';

interface AffiliateLinkProps {
  merchant: Merchant;
  productId: string;
  children: React.ReactNode;
  className?: string;
  variant?: 'button' | 'link';
}

export function AffiliateLink({ merchant, productId, children, className = '', variant = 'link' }: AffiliateLinkProps) {
  const url = getAffiliateUrl({ merchant, productId });
  const linkProps = getAffiliateLinkProps(url);

  if (variant === 'button') {
    return (
      <a
        {...linkProps}
        className={`inline-flex items-center justify-center gap-2 bg-[#febd69] hover:bg-[#f3a847] text-[#131921] font-bold px-6 py-3 rounded-lg transition-all hover:shadow-lg active:scale-[0.98] ${className}`}
      >
        {children}
        <ExternalLink size={16} />
      </a>
    );
  }

  return (
    <a
      {...linkProps}
      className={`text-[#007185] hover:text-[#c7511f] hover:underline inline-flex items-center gap-1 ${className}`}
    >
      {children}
      <ExternalLink size={12} className="shrink-0" />
    </a>
  );
}

interface CheckPriceButtonProps {
  merchant: Merchant;
  productId: string;
  customUrl?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function CheckPriceButton({ merchant, productId, customUrl, className = '', size = 'md' }: CheckPriceButtonProps) {
  const autoUrl = getAffiliateUrl({ merchant, productId });
  const url = customUrl || autoUrl;
  const linkProps = getAffiliateLinkProps(url);
  const merchantName = getMerchantName(merchant);

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3',
    lg: 'px-8 py-4 text-lg',
  };

  return (
    <a
      {...linkProps}
      className={`inline-flex items-center justify-center gap-2 bg-[#febd69] hover:bg-[#f3a847] text-[#131921] font-bold rounded-lg transition-all hover:shadow-lg active:scale-[0.98] ${sizeClasses[size]} ${className}`}
    >
      <ExternalLink size={size === 'sm' ? 14 : 16} />
      Check Price on {merchantName}
    </a>
  );
}

interface ViewLatestDealButtonProps {
  merchant: Merchant;
  productId: string;
  customUrl?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function ViewLatestDealButton({ merchant, productId, customUrl, className = '', size = 'md' }: ViewLatestDealButtonProps) {
  const autoUrl = getAffiliateUrl({ merchant, productId });
  const url = customUrl || autoUrl;
  const linkProps = getAffiliateLinkProps(url);
  const merchantName = getMerchantName(merchant);

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3',
    lg: 'px-8 py-4 text-lg',
  };

  return (
    <a
      {...linkProps}
      className={`inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#febd69] via-[#f3a847] to-[#febd69] hover:shadow-md hover:shadow-[#febd69]/20 text-[#131921] font-bold rounded-lg transition-all active:scale-[0.98] ${sizeClasses[size]} ${className}`}
    >
      <ExternalLink size={size === 'sm' ? 14 : 16} />
      View Latest Deal on {merchantName}
    </a>
  );
}
