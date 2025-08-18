import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { 
  ArrowLeft,
  Award,
  Star,
  Crown,
  Plane,
  Calendar,
  Users,
  Gift,
  Sparkles,
  Coffee,
  ShoppingBag,
  Clock,
  CheckCircle
} from "lucide-react";

interface RewardDetailsProps {
  onPageChange?: (page: string, params?: any) => void;
}

interface TierBenefit {
  id: string;
  title: string;
  description: string;
  category: "flight" | "discount" | "event" | "service" | "dining" | "shopping";
  icon: any;
  value?: string;
}

const tierBenefits = {
  Silver: [
    {
      id: "S001",
      title: "Ngày hội thành viên",
      description: "Tham dự sự kiện đặc biệt dành riêng cho thành viên Silver với nhiều hoạt động thú vị",
      category: "event" as const,
      icon: Calendar,
      value: "Miễn phí"
    },
    {
      id: "S002", 
      title: "Giá chuyến bay ưu đãi Silver",
      description: "Giảm giá 5% cho tất cả chuyến bay nội địa khi đặt trước 30 ngày",
      category: "flight" as const,
      icon: Plane,
      value: "5% OFF"
    },
    {
      id: "S003",
      title: "Ưu tiên check-in",
      description: "Được ưu tiên tại quầy check-in dành riêng cho thành viên",
      category: "service" as const,
      icon: CheckCircle,
      value: "Miễn phí"
    },
    {
      id: "S004",
      title: "Tích lũy dặm cơ bản",
      description: "Tích lũy 100% dặm bay cho mỗi chuyến bay",
      category: "flight" as const,
      icon: Award,
      value: "100%"
    }
  ],
  Gold: [
    {
      id: "G001",
      title: "Ưu đãi vé tốt cho hạng Gold",
      description: "Giảm giá 15% cho tất cả chuyến bay quốc tế và 10% cho chuyến bay nội địa",
      category: "flight" as const,
      icon: Plane,
      value: "15% OFF"
    },
    {
      id: "G002",
      title: "Phòng chờ Gold Lounge",
      description: "Miễn phí sử dụng phòng chờ Gold tại các sân bay chính",
      category: "service" as const,
      icon: Crown,
      value: "Miễn phí"
    },
    {
      id: "G003",
      title: "Hành lý ký gửi miễn phí",
      description: "Miễn phí 30kg hành lý ký gửi cho chuyến bay quốc tế",
      category: "flight" as const,
      icon: ShoppingBag,
      value: "30kg"
    },
    {
      id: "G004",
      title: "Tích lũy dặm tăng cường",
      description: "Tích lũy 125% dặm bay cho mỗi chuyến bay",
      category: "flight" as const,
      icon: Award,
      value: "125%"
    },
    {
      id: "G005",
      title: "Ưu đãi ẩm thực cao cấp",
      description: "Giảm giá 20% tại các nhà hàng đối tác và phòng chờ",
      category: "dining" as const,
      icon: Coffee,
      value: "20% OFF"
    },
    {
      id: "G006",
      title: "Upgrade hạng ghế ưu tiên",
      description: "Ưu tiên nâng cấp lên hạng Premium Economy miễn phí khi có chỗ trống",
      category: "flight" as const,
      icon: Sparkles,
      value: "Miễn phí"
    }
  ],
  Platinum: [
    {
      id: "P001",
      title: "Ưu đãi vé tốt cho hạng Platinum",
      description: "Giảm giá 25% cho tất cả chuyến bay và ưu tiên chọn chỗ ngồi tốt nhất",
      category: "flight" as const,
      icon: Plane,
      value: "25% OFF"
    },
    {
      id: "P002",
      title: "Phòng chờ Platinum VIP",
      description: "Truy cập không giới hạn phòng chờ Platinum với dịch vụ 5 sao",
      category: "service" as const,
      icon: Crown,
      value: "VIP Access"
    },
    {
      id: "P003",
      title: "Business Class Upgrade",
      description: "Miễn phí nâng cấp lên hạng Business Class cho 2 chuyến bay/năm",
      category: "flight" as const,
      icon: Sparkles,
      value: "2 lần/năm"
    },
    {
      id: "P004",
      title: "Tích lũy dặm cao cấp",
      description: "Tích lũy 150% dặm bay cho mỗi chuyến bay",
      category: "flight" as const,
      icon: Award,
      value: "150%"
    },
    {
      id: "P005",
      title: "Concierge Service",
      description: "Dịch vụ hỗ trợ cá nhân 24/7 cho việc đặt chỗ và thay đổi vé",
      category: "service" as const,
      icon: Users,
      value: "24/7"
    },
    {
      id: "P006",
      title: "Ưu đãi mua sắm cao cấp",
      description: "Giảm giá 30% tại cửa hàng miễn thuế và các đối tác mua sắm",
      category: "shopping" as const,
      icon: ShoppingBag,
      value: "30% OFF"
    },
    {
      id: "P007",
      title: "Priority Everything",
      description: "Ưu tiên trong tất cả dịch vụ: check-in, boarding, hành lý",
      category: "service" as const,
      icon: CheckCircle,
      value: "Tất cả"
    }
  ]
};

const getTierIcon = (tier: string) => {
  switch (tier) {
    case "Silver":
      return <Award className="h-6 w-6 text-gray-500" />;
    case "Gold":
      return <Star className="h-6 w-6 text-yellow-500" />;
    case "Platinum":
      return <Crown className="h-6 w-6 text-purple-500" />;
    default:
      return <Award className="h-6 w-6 text-gray-500" />;
  }
};

const getTierColor = (tier: string) => {
  switch (tier) {
    case "Silver":
      return "bg-gray-100 text-gray-700 border-gray-200";
    case "Gold":
      return "bg-yellow-100 text-yellow-700 border-yellow-200";
    case "Platinum":
      return "bg-purple-100 text-purple-700 border-purple-200";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
};

const getTierGradient = (tier: string) => {
  switch (tier) {
    case "Silver":
      return "from-gray-50 to-gray-100";
    case "Gold":
      return "from-yellow-50 to-yellow-100";
    case "Platinum":
      return "from-purple-50 to-purple-100";
    default:
      return "from-gray-50 to-gray-100";
  }
};

const getCategoryIcon = (category: string) => {
  switch (category) {
    case "flight":
      return Plane;
    case "discount":
      return Gift;
    case "event":
      return Calendar;
    case "service":
      return Users;
    case "dining":
      return Coffee;
    case "shopping":
      return ShoppingBag;
    default:
      return Gift;
  }
};

export function RewardDetails({ onPageChange }: RewardDetailsProps) {
  const BenefitCard = ({ benefit, tier }: { benefit: TierBenefit; tier: string }) => {
    const IconComponent = getCategoryIcon(benefit.category);
    
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <div className={`p-3 rounded-full ${
              tier === 'Silver' ? 'bg-gray-100' :
              tier === 'Gold' ? 'bg-yellow-100' :
              'bg-purple-100'
            }`}>
              <IconComponent className={`h-6 w-6 ${
                tier === 'Silver' ? 'text-gray-600' :
                tier === 'Gold' ? 'text-yellow-600' :
                'text-purple-600'
              }`} />
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-lg">{benefit.title}</h3>
                {benefit.value && (
                  <Badge variant="outline" className={`${
                    tier === 'Silver' ? 'border-gray-300 text-gray-700' :
                    tier === 'Gold' ? 'border-yellow-300 text-yellow-700' :
                    'border-purple-300 text-purple-700'
                  }`}>
                    {benefit.value}
                  </Badge>
                )}
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">
                {benefit.description}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const TierSection = ({ tier }: { tier: keyof typeof tierBenefits }) => {
    const benefits = tierBenefits[tier];
    
    return (
      <Card className={`border-2 bg-gradient-to-r ${getTierGradient(tier)} ${getTierColor(tier)}`}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-3">
            {getTierIcon(tier)}
            <span className="text-2xl">{tier} Member Benefits</span>
          </CardTitle>
          <p className="text-sm opacity-80">
            {tier === 'Silver' && 'Những quyền lợi dành cho thành viên Silver - bước đầu trong hành trình của bạn'}
            {tier === 'Gold' && 'Những quyền lợi cao cấp dành cho thành viên Gold - trải nghiệm đẳng cấp'}
            {tier === 'Platinum' && 'Những quyền lợi VIP dành cho thành viên Platinum - dịch vụ hoàn hảo'}
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {benefits.map(benefit => (
              <BenefitCard key={benefit.id} benefit={benefit} tier={tier} />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => onPageChange && onPageChange('redeem')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Redeem
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Reward Details</h1>
          <p className="text-gray-600 mt-1">
            Discover all the exclusive benefits and privileges for each membership tier
          </p>
        </div>
      </div>

      {/* Tier Overview */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Vietnam Airlines Loyalty Program</h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              Chương trình khách hàng thân thiết với 3 hạng thành viên: Silver, Gold và Platinum. 
              Mỗi hạng mang đến những quyền lợi và trải nghiệm độc quyền phù hợp với nhu cầu của bạn.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="text-center">
              <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                <Award className="h-8 w-8 text-gray-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Silver</h3>
              <p className="text-sm text-gray-600 mt-1">Entry Level</p>
              <p className="text-xs text-gray-500">0 - 25,000 miles</p>
            </div>
            
            <div className="text-center">
              <div className="p-4 bg-yellow-100 rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                <Star className="h-8 w-8 text-yellow-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Gold</h3>
              <p className="text-sm text-gray-600 mt-1">Premium Level</p>
              <p className="text-xs text-gray-500">25,000 - 75,000 miles</p>
            </div>
            
            <div className="text-center">
              <div className="p-4 bg-purple-100 rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                <Crown className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Platinum</h3>
              <p className="text-sm text-gray-600 mt-1">Elite Level</p>
              <p className="text-xs text-gray-500">75,000+ miles</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Silver Tier Details */}
      <TierSection tier="Silver" />

      {/* Gold Tier Details */}
      <TierSection tier="Gold" />

      {/* Platinum Tier Details */}
      <TierSection tier="Platinum" />

      {/* How to Upgrade */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <CardContent className="p-6">
          <div className="text-center">
            <Sparkles className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-3">How to Upgrade Your Tier</h2>
            <p className="text-gray-600 max-w-2xl mx-auto mb-6">
              Nâng cấp hạng thành viên của bạn bằng cách tích lũy dặm bay từ các chuyến bay, 
              sử dụng dịch vụ của đối tác hoặc tham gia các chương trình khuyến mãi đặc biệt.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="p-4 bg-white rounded-lg border border-green-200">
                <Plane className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h3 className="font-semibold mb-2">Fly More</h3>
                <p className="text-sm text-gray-600">Tích lũy dặm từ các chuyến bay thường xuyên</p>
              </div>
              
              <div className="p-4 bg-white rounded-lg border border-green-200">
                <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h3 className="font-semibold mb-2">Partner Services</h3>
                <p className="text-sm text-gray-600">Sử dụng dịch vụ khách sạn, thuê xe đối tác</p>
              </div>
              
              <div className="p-4 bg-white rounded-lg border border-green-200">
                <Gift className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h3 className="font-semibold mb-2">Special Offers</h3>
                <p className="text-sm text-gray-600">Tham gia các chương trình khuyến mãi</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}